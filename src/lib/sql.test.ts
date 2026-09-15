import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatSql, tokenizeSql } from "./sql.ts";

describe("tokenizeSql", () => {
  it("keeps strings and comments intact", () => {
    const kinds = tokenizeSql(
      "select 'from', \"where\" from t -- not a clause\n/* block */",
    ).map((token) => token.kind);
    assert.ok(kinds.includes("string"));
    assert.ok(kinds.includes("comment"));
    assert.equal(
      tokenizeSql("select 'it''s'").some((token) => token.value === "'it''s'"),
      true,
    );
  });
});

describe("formatSql", () => {
  it("returns empty output for blank input", () => {
    assert.equal(formatSql(""), "");
    assert.equal(formatSql("   \n\t"), "");
  });

  it("pretty-prints a select list, from, where, and order", () => {
    assert.equal(
      formatSql("select id, name from users where id = 1 order by name"),
      [
        "SELECT",
        "  id,",
        "  name",
        "FROM",
        "  users",
        "WHERE",
        "  id = 1",
        "ORDER BY",
        "  name",
      ].join("\n"),
    );
  });

  it("breaks joins and ON, and keeps BETWEEN's AND inline", () => {
    assert.equal(
      formatSql(
        "select u.id from users u inner join orders o on o.user_id = u.id where u.score between 1 and 10 and u.active = 1",
      ),
      [
        "SELECT",
        "  u.id",
        "FROM",
        "  users u",
        "  INNER JOIN orders o",
        "    ON o.user_id = u.id",
        "WHERE",
        "  u.score BETWEEN 1 AND 10",
        "  AND u.active = 1",
      ].join("\n"),
    );
  });

  it("indents nested subqueries and keeps function calls compact", () => {
    assert.equal(
      formatSql(
        "select count(*), coalesce(name, 'n/a') from (select id, name from users) t",
      ),
      [
        "SELECT",
        "  COUNT(*),",
        "  COALESCE(name, 'n/a')",
        "FROM",
        "  (",
        "    SELECT",
        "      id,",
        "      name",
        "    FROM",
        "      users",
        "  ) t",
      ].join("\n"),
    );
  });

  it("formats insert, update, and delete", () => {
    assert.equal(
      formatSql("insert into users (id, name) values (1, 'ada')"),
      ["INSERT INTO", "  users (id, name)", "VALUES", "  (1, 'ada')"].join("\n"),
    );
    assert.equal(
      formatSql("update users set name = 'ada', email = 'a@b.c' where id = 1"),
      [
        "UPDATE",
        "  users",
        "SET",
        "  name = 'ada',",
        "  email = 'a@b.c'",
        "WHERE",
        "  id = 1",
      ].join("\n"),
    );
    assert.equal(
      formatSql("delete from users where id = 1"),
      ["DELETE FROM", "  users", "WHERE", "  id = 1"].join("\n"),
    );
  });

  it("formats CASE and does not treat keywords inside strings as clauses", () => {
    assert.equal(
      formatSql("select case when x = 1 then 'from' else 'where' end from t"),
      [
        "SELECT",
        "  CASE",
        "    WHEN x = 1 THEN 'from'",
        "    ELSE 'where'",
        "  END",
        "FROM",
        "  t",
      ].join("\n"),
    );
  });

  it("keeps line comments and is stable when run twice", () => {
    const formatted = formatSql("select id from t -- keep me");
    assert.equal(formatted, ["SELECT", "  id", "FROM", "  t -- keep me"].join("\n"));
    assert.equal(formatSql(formatted), formatted);
  });

  it("separates statements and uppercases distinct", () => {
    assert.equal(
      formatSql("select distinct status, count(*) from users group by status having count(*) > 1 limit 10; select 2;"),
      [
        "SELECT DISTINCT",
        "  status,",
        "  COUNT(*)",
        "FROM",
        "  users",
        "GROUP BY",
        "  status",
        "HAVING",
        "  COUNT(*) > 1",
        "LIMIT",
        "  10;",
        "SELECT",
        "  2;",
      ].join("\n"),
    );
  });
});
