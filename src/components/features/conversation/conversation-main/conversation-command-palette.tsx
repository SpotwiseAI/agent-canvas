import { useTranslation } from "react-i18next";
import { Globe, ListTodo, SquareChevronRight } from "lucide-react";
import DocumentIcon from "#/icons/document.svg?react";
import DoubleCheckIcon from "#/icons/double-check.svg?react";
import { cn } from "#/utils/utils";
import { I18nKey } from "#/i18n/declaration";
import { useSelectConversationTab } from "#/hooks/use-select-conversation-tab";
import { useTaskList } from "#/hooks/use-task-list";
import { useActiveBackend } from "#/contexts/active-backend-context";
import type { ConversationTab } from "#/stores/conversation-store";

interface PaletteEntry {
  tab: ConversationTab;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
}

/**
 * Codex-style launcher rail. Shown on the right edge while the conversation's
 * right panel is collapsed, giving one-click access to each panel. Clicking an
 * entry opens the panel on that tab via the same path the tab bar uses.
 */
export function ConversationCommandPalette() {
  const { t } = useTranslation("openhands");
  const { navigateToTab, isRightPanelShown } = useSelectConversationTab();
  const { hasTaskList } = useTaskList();
  const { backend } = useActiveBackend();

  if (isRightPanelShown) return null;

  const entries: PaletteEntry[] = [
    { tab: "files", icon: DocumentIcon, label: t(I18nKey.COMMON$FILES) },
  ];

  if (hasTaskList) {
    entries.push({
      tab: "tasklist",
      icon: DoubleCheckIcon,
      label: t(I18nKey.COMMON$TASK_LIST),
    });
  }

  if (backend.kind === "cloud") {
    entries.push({
      tab: "planner",
      icon: ListTodo,
      label: t(I18nKey.COMMON$PLANNER),
    });
  }

  entries.push(
    {
      tab: "terminal",
      icon: SquareChevronRight,
      label: t(I18nKey.COMMON$TERMINAL),
    },
    { tab: "browser", icon: Globe, label: t(I18nKey.COMMON$BROWSER) },
  );

  return (
    <div
      data-testid="conversation-command-palette"
      className="pointer-events-none absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-1.5 md:flex"
    >
      {entries.map(({ tab, icon: Icon, label }) => (
        <button
          key={tab}
          type="button"
          onClick={() => navigateToTab(tab)}
          className={cn(
            "pointer-events-auto flex min-w-[176px] items-center gap-2.5 rounded-[12px]",
            "border border-border bg-surface px-3 py-2 text-sm text-foreground",
            "shadow-[var(--oh-overlay-shadow)] transition-colors",
            "hover:bg-surface-raised",
          )}
        >
          <Icon className="h-4 w-4 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        </button>
      ))}
    </div>
  );
}
