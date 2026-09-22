// Generates the HR Setup master list pages (data-4).
// Run: node scripts/gen-pages-setup.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(process.cwd(), "src/app/(app)");

function col(c) {
  const parts = [`key: "${c.key}"`, `header: "${c.header}"`];
  if (c.sortable) parts.push("sortable: true");
  if (c.align) parts.push(`align: "${c.align}"`);
  if (c.hide) parts.push(`className: "hidden lg:table-cell"`);
  let cell = "";
  if (c.render === "bold") cell = `, cell: (x) => <span className="font-medium">{x.${c.key}}</span>`;
  else if (c.render === "status") cell = `, cell: (x) => <StatusBadge status={x.${c.key}} />`;
  else if (c.render === "money") cell = `, cell: (x) => <span className="tabular-nums font-medium">{fmtMoney(x.${c.key})}</span>`;
  else if (c.render === "date") cell = `, cell: (x) => fmtDate(x.${c.key})`;
  else if (c.render === "bool") cell = `, cell: (x) => <Badge variant={x.${c.key} ? "secondary" : "outline"}>{x.${c.key} ? "Yes" : "No"}</Badge>`;
  else if (c.render === "muted") cell = `, cell: (x) => <span className="text-muted-foreground">{x.${c.key}}</span>`;
  else if (c.render === "pct") cell = `, cell: (x) => <span className="tabular-nums">{x.${c.key}}%</span>`;
  return `  { ${parts.join(", ")}${cell} },`;
}

function page(spec) {
  const uses = { status: false, bool: false, date: false, money: false };
  for (const c of spec.cols) {
    if (c.render === "status") uses.status = true;
    if (c.render === "bool") uses.bool = true;
    if (c.render === "date") uses.date = true;
    if (c.render === "money") uses.money = true;
  }
  const helpers = [uses.date && "fmtDate", uses.money && "fmtMoney"].filter(Boolean);
  const imports = [
    `"use client"`,
    ``,
    `import { PageHeader } from "@/components/shared/page-header"`,
    `import { DataTable, type Column } from "@/components/shared/data-table"`,
    uses.status && `import { StatusBadge } from "@/components/shared/status-badge"`,
    uses.bool && `import { Badge } from "@/components/ui/badge"`,
    `import { ${spec.rows}, type ${spec.type} } from "@/lib/mock/${spec.mod}"`,
    helpers.length && `import { ${helpers.join(", ")} } from "@/lib/mock/data"`,
  ].filter(Boolean);
  const body = `${imports.join("\n")};

const columns: Column<${spec.type}>[] = [
${spec.cols.map(col).join("\n")}
];

export default function ${spec.component}() {
  return (
    <>
      <PageHeader title="${spec.title}" description="${spec.desc}" />
      <DataTable columns={columns} rows={${spec.rows}} searchKeys={[${spec.search.map((s) => `"${s}"`).join(", ")}]} pageSize={10} />
    </>
  );
}
`;
  const file = join(ROOT, spec.route, "page.tsx");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
  return spec.route;
}

const specs = [
  { route: "recruitment/interview-types", component: "InterviewTypesPage", mod: "data-4", rows: "interviewTypes", type: "InterviewType", title: "Interview Types", desc: "Classifications used when scheduling interviews.", search: ["name", "description"], cols: [
    { key: "name", header: "Interview Type", sortable: true, render: "bold" },
    { key: "description", header: "Description", render: "muted" },
  ] },
  { route: "performance/feedback-criteria", component: "FeedbackCriteriaPage", mod: "data-4", rows: "feedbackCriteria", type: "FeedbackCriteria", title: "Feedback Criteria", desc: "Criteria used across appraisal feedback forms.", search: ["name", "category"], cols: [
    { key: "name", header: "Criteria", sortable: true, render: "bold" },
    { key: "category", header: "Category", sortable: true },
  ] },
  { route: "leave/holiday-list-assignment", component: "HolidayListAssignmentPage", mod: "data-4", rows: "holidayListAssignments", type: "HolidayListAssignment", title: "Holiday List Assignment", desc: "Assigns a holiday list to specific employees.", search: ["employee", "holidayList"], cols: [
    { key: "employee", header: "Employee", sortable: true, render: "bold" },
    { key: "holidayList", header: "Holiday List", sortable: true },
    { key: "company", header: "Company", sortable: true, hide: true },
    { key: "status", header: "Status", render: "status" },
  ] },
  { route: "recruitment/job-opening-templates", component: "JobOpeningTemplatesPage", mod: "data-4", rows: "jobOpeningTemplates", type: "JobOpeningTemplate", title: "Job Opening Templates", desc: "Reusable templates for creating job openings.", search: ["name", "description"], cols: [
    { key: "name", header: "Template", sortable: true, render: "bold" },
    { key: "description", header: "Description", render: "muted" },
  ] },
  { route: "recruitment/job-offer-term-templates", component: "JobOfferTermTemplatesPage", mod: "data-4", rows: "jobOfferTermTemplates", type: "JobOfferTermTemplate", title: "Job Offer Term Templates", desc: "Standard terms attached to job offers.", search: ["name", "offerTerm"], cols: [
    { key: "name", header: "Term Template", sortable: true, render: "bold" },
    { key: "offerTerm", header: "Offer Term", sortable: true },
    { key: "weight", header: "Weight", align: "center", render: "pct" },
  ] },
  { route: "recruitment/appointment-letter-templates", component: "AppointmentLetterTemplatesPage", mod: "data-4", rows: "appointmentLetterTemplates", type: "AppointmentLetterTemplate", title: "Appointment Letter Templates", desc: "Templates used to generate appointment letters.", search: ["name", "company"], cols: [
    { key: "name", header: "Template", sortable: true, render: "bold" },
    { key: "company", header: "Company", sortable: true },
    { key: "basedOn", header: "Based On", sortable: true, render: "muted" },
  ] },
  { route: "tenure/training-feedback", component: "TrainingFeedbackPage", mod: "data-4", rows: "trainingFeedback", type: "TrainingFeedback", title: "Training Feedback", desc: "Employee feedback captured against training events.", search: ["employee", "trainingEvent"], cols: [
    { key: "employee", header: "Employee", sortable: true, render: "bold" },
    { key: "trainingEvent", header: "Training Event", sortable: true },
    { key: "trainerName", header: "Trainer", sortable: true, hide: true },
    { key: "rating", header: "Rating", align: "center", render: "pct" },
    { key: "status", header: "Status", render: "status" },
  ] },
];

for (const s of specs) console.log("generated", page(s));
console.log(`\nDone. ${specs.length} setup master pages.`);
