import React from "react";
import { useTranslation } from "react-i18next";
import { Folder, GitBranch } from "lucide-react";

import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useNavigation } from "#/context/navigation-context";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { ToggleSwitch } from "#/ui/toggle-switch";
import { BrandButton } from "#/components/features/settings/brand-button";
import { NEW_CONVERSATION_DROPDOWN_SURFACE } from "./new-conversation-dropdown-styles";

/** The project/repo a composed conversation launches against. */
export interface ComposerSource {
  /** Display name shown in the source chip (repo or folder name). */
  label: string;
  /** Worktree/folder path passed to the agent-server. Absent for quick start. */
  workingDir?: string;
  /** Branch shown beside the source, when known. */
  branch?: string | null;
}

interface ConductorWorkspaceComposerProps {
  source: ComposerSource | null;
  anchor: { top: number; left: number };
  onClose: () => void;
}

export function ConductorWorkspaceComposer({
  source,
  anchor,
  onClose,
}: ConductorWorkspaceComposerProps) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [task, setTask] = React.useState("");
  const [createMore, setCreateMore] = React.useState(false);

  const { mutate: createConversation, isPending } = useCreateConversation();
  const isCreatingElsewhere = useIsCreatingConversation();
  const isCreating = isPending || isCreatingElsewhere;

  React.useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  React.useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const create = () => {
    if (isCreating) return;
    const query = task.trim() || undefined;
    createConversation(
      { workingDir: source?.workingDir, query },
      {
        onSuccess: (data) => {
          if (createMore) {
            // Batch-create: keep the popover open and reset only the task so
            // the user can immediately queue another run on the same source.
            setTask("");
            textareaRef.current?.focus();
            return;
          }
          onClose();
          navigate(`/conversations/${data.conversation_id}`);
        },
      },
    );
  };

  const onTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      create();
    }
  };

  return (
    <div
      ref={rootRef}
      data-testid="conductor-workspace-composer"
      className={cn(NEW_CONVERSATION_DROPDOWN_SURFACE, "w-[320px] p-3")}
      style={{ position: "fixed", top: anchor.top, left: anchor.left }}
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--oh-muted)]">
        {source ? (
          <>
            <Folder size={13} className="shrink-0" aria-hidden />
            <span className="truncate font-medium text-foreground">
              {source.label}
            </span>
            {source.branch ? (
              <span className="flex min-w-0 items-center gap-1">
                <GitBranch size={12} className="shrink-0" aria-hidden />
                <span className="truncate">{source.branch}</span>
              </span>
            ) : null}
          </>
        ) : (
          <span className="font-medium text-foreground">
            {t(I18nKey.CONVERSATION_PANEL$QUICK_START)}
          </span>
        )}
      </div>

      <textarea
        ref={textareaRef}
        data-testid="conductor-workspace-composer-input"
        value={task}
        onChange={(event) => setTask(event.target.value)}
        onKeyDown={onTextareaKeyDown}
        rows={3}
        placeholder={t(I18nKey.SUGGESTIONS$WHAT_TO_BUILD)}
        className={cn(
          "w-full resize-none rounded-lg border border-[var(--oh-border)] bg-[var(--oh-surface)]",
          "px-3 py-2 text-sm text-foreground outline-none",
          "placeholder:text-[var(--oh-text-secondary)] focus:border-[var(--oh-border-subtle)]",
        )}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCreateMore((value) => !value)}
          className="flex items-center gap-2 text-xs text-[var(--oh-muted)]"
        >
          <ToggleSwitch
            enabled={createMore}
            label={t(I18nKey.CONVERSATION_PANEL$CREATE_MORE)}
            onToggle={() => setCreateMore((value) => !value)}
          />
          {t(I18nKey.CONVERSATION_PANEL$CREATE_MORE)}
        </button>
        <BrandButton
          type="button"
          variant="primary"
          testId="conductor-workspace-composer-create"
          isDisabled={isCreating}
          onClick={create}
        >
          {t(I18nKey.BUTTON$CREATE)}
        </BrandButton>
      </div>
    </div>
  );
}
