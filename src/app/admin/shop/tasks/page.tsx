import Link from "next/link";
import { taskBuckets } from "@/modules/shop/services/crm-admin";
import { displayCustomer, optionLabel, TASK_PRIORITIES } from "@/modules/shop/ui/admin/crm/labels";
import { TaskStatusButtons } from "@/modules/shop/ui/admin/crm/Tasks";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader, Panel, StatusBadge } from "@/modules/shop/ui/admin/primitives";
import { formatDateTime } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

type Task = Awaited<ReturnType<typeof taskBuckets>>["overdue"][number];

function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  if (!tasks.length) return <p className="p-5 text-sm text-neutral-500 sm:p-6">{empty}</p>;
  return (
    <ul className="divide-y divide-neutral-100">
      {tasks.map((t) => (
        <li key={t.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 text-sm">
            <p className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/shop/customers/${t.customerId}?tab=tasks`} className="font-medium text-neutral-950 hover:underline">{t.title}</Link>
              {t.status === "IN_PROGRESS" && <StatusBadge status={t.status} />}
              {(t.priority === "HIGH" || t.priority === "URGENT") && (
                <span className="rounded-full border border-neutral-950 px-2 py-0.5 text-xs font-semibold text-neutral-950">{optionLabel(TASK_PRIORITIES, t.priority)}</span>
              )}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {displayCustomer(t.customer)}, {t.dueAt ? `due ${formatDateTime(t.dueAt)}` : "no due date"}
            </p>
          </div>
          <TaskStatusButtons taskId={t.id} status={t.status} compact />
        </li>
      ))}
    </ul>
  );
}

const capped = (n: number) => (n >= 20 ? "20+" : String(n));

export default async function AdminTasksPage() {
  const guard = await guardStaffPage("crm:write", "/admin/shop/tasks");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/tasks" />;

  const b = await taskBuckets(guard.ctx.staff.id);
  return (
    <>
      <PageHeader title="Tasks" description="Customer follow-ups. Create tasks from a customer's Tasks tab." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title={`My tasks (${capped(b.myTasks.length)})`} description="Open tasks assigned to you." padded={false} className="lg:col-span-2">
          <TaskList tasks={b.myTasks} empty="Nothing assigned to you." />
        </Panel>
        <Panel title={`Overdue (${capped(b.overdue.length)})`} description="Everyone's open tasks past their due date." padded={false}>
          <TaskList tasks={b.overdue} empty="Nothing overdue." />
        </Panel>
        <Panel title={`Due today (${capped(b.dueToday.length)})`} padded={false}>
          <TaskList tasks={b.dueToday} empty="Nothing else due today." />
        </Panel>
        <Panel title={`Upcoming (${capped(b.upcoming.length)})`} description="Due in the next seven days." padded={false} className="lg:col-span-2">
          <TaskList tasks={b.upcoming} empty="Nothing due this week." />
        </Panel>
      </div>
    </>
  );
}
