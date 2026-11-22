export type CourseLevel = "regular" | "honors" | "ap";

export const GRADE_POINTS: { grade: string; points: number }[] = [
  { grade: "A+", points: 4.0 },
  { grade: "A", points: 4.0 },
  { grade: "A-", points: 3.7 },
  { grade: "B+", points: 3.3 },
  { grade: "B", points: 3.0 },
  { grade: "B-", points: 2.7 },
  { grade: "C+", points: 2.3 },
  { grade: "C", points: 2.0 },
  { grade: "C-", points: 1.7 },
  { grade: "D+", points: 1.3 },
  { grade: "D", points: 1.0 },
  { grade: "D-", points: 0.7 },
  { grade: "F", points: 0.0 },
];

export type GpaCourse = { grade: string; credits: number; level: CourseLevel };

export type GpaInput = {
  courses: GpaCourse[];
  honorsBonus: number;
  apBonus: number;
  priorGpa: number | null;
  priorCredits: number | null;
};

export type GpaResult =
  | { valid: false; error: string }
  | {
      valid: true;
      semesterCredits: number;
      semesterQualityPoints: number;
      semesterGpa: number;
      weightedSemesterGpa: number;
      unweightedSemesterGpa: number;
      cumulativeGpa: number | null;
      cumulativeCredits: number | null;
    };

export function roundTo(n: number, places: number): number {
  const f = 10 ** places;
  return Math.round((n + Number.EPSILON) * f) / f;
}

export function pointsForGrade(grade: string): number | null {
  const row = GRADE_POINTS.find((g) => g.grade === grade.trim().toUpperCase());
  return row ? row.points : null;
}

/** Points for one course. The honors/AP bonus is not added to an F. */
export function coursePoints(course: GpaCourse, honorsBonus: number, apBonus: number, weighted: boolean): number | null {
  const base = pointsForGrade(course.grade);
  if (base === null) return null;
  if (!weighted || base === 0) return base;
  if (course.level === "honors") return base + honorsBonus;
  if (course.level === "ap") return base + apBonus;
  return base;
}

export function computeGpa(input: GpaInput): GpaResult {
  const { courses, honorsBonus, apBonus, priorGpa, priorCredits } = input;
  if (!Number.isFinite(honorsBonus) || !Number.isFinite(apBonus) || honorsBonus < 0 || apBonus < 0) {
    return { valid: false, error: "Honors and AP bonus points must be zero or more." };
  }
  const rows = courses.filter((c) => c.credits !== 0 || c.grade !== "");
  if (rows.length === 0) return { valid: false, error: "Add at least one course with a grade and credit hours." };
  let credits = 0;
  let weightedPts = 0;
  let plainPts = 0;
  for (const c of rows) {
    if (!Number.isFinite(c.credits) || c.credits <= 0) return { valid: false, error: "Credit hours must be greater than zero for every course." };
    const w = coursePoints(c, honorsBonus, apBonus, true);
    const p = coursePoints(c, honorsBonus, apBonus, false);
    if (w === null || p === null) return { valid: false, error: "Choose a letter grade for every course." };
    credits += c.credits;
    weightedPts += w * c.credits;
    plainPts += p * c.credits;
  }
  const weightedSemesterGpa = roundTo(weightedPts / credits, 2);
  const unweightedSemesterGpa = roundTo(plainPts / credits, 2);
  let cumulativeGpa: number | null = null;
  let cumulativeCredits: number | null = null;
  if (priorGpa !== null && priorCredits !== null && priorCredits > 0) {
    if (!Number.isFinite(priorGpa) || priorGpa < 0 || !Number.isFinite(priorCredits)) {
      return { valid: false, error: "Prior GPA and prior credits must be zero or more." };
    }
    cumulativeCredits = roundTo(priorCredits + credits, 2);
    cumulativeGpa = roundTo((priorGpa * priorCredits + weightedPts) / (priorCredits + credits), 2);
  }
  return {
    valid: true,
    semesterCredits: roundTo(credits, 2),
    semesterQualityPoints: roundTo(weightedPts, 2),
    semesterGpa: weightedSemesterGpa,
    weightedSemesterGpa,
    unweightedSemesterGpa,
    cumulativeGpa,
    cumulativeCredits,
  };
}
