import React from "react";
import { useTranslation } from "react-i18next";
import { Folder, FolderPlus, Globe, Plus } from "lucide-react";

import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useNavigation } from "#/context/navigation-context";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { usePopoverFixedPlacement } from "#/hooks/use-popover-fixed-placement";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  dropdownMenuListClassName,
  dropdownMenuRowClassName,
  dropdownMenuRowIconWrapperClassName,
} from "#/utils/dropdown-classes";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { OpenWorkspaceDialog } from "#/components/features/home/open-workspace-dialog";
import { NEW_CONVERSATION_DROPDOWN_SURFACE } from "./new-conversation-dropdown-styles";

const triggerClassName = cn(
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
  "text-[var(--oh-muted)] transition-colors",
  "hover:bg-[var(--oh-surface-raised)] hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--oh-border)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/**
 * Conductor-style "+ New workspace" control for the conversation panel header.
 * Surfaces three entry points — open a local project, open a GitHub-App repo,
 * or quick-start a workspace-less conversation — and launches a conversation
 * directly from the chosen source.
 */
export function ConductorNewWorkspaceMenu() {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();

  const [open, setOpen] = React.useState(false);
  const [dialogSource, setDialogSource] = React.useState<
    "repo" | "workspace" | null
  >(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerWrapRef = React.useRef<HTMLSpanElement>(null);
  const fixedBox = usePopoverFixedPlacement(triggerWrapRef, {
    open,
    enabled: true,
  });

  const { mutate: createConversation, isPending } = useCreateConversation();
  const isCreatingElsewhere = useIsCreatingConversation();
  const isCreating = isPending || isCreatingElsewhere;

  const dialogOpen = dialogSource !== null;

  React.useEffect(() => {
    if (!open || dialogOpen) return undefined;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, dialogOpen]);

  React.useEffect(() => {
    if (!open || dialogOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dialogOpen]);

  const launch = (workingDir?: string) => {
    if (isCreating) return;
    createConversation(
      { workingDir },
      {
        onSuccess: (data) => {
          setOpen(false);
          setDialogSource(null);
          navigate(`/conversations/${data.conversation_id}`);
        },
      },
    );
  };

  const newWorkspaceLabel = t(I18nKey.CONVERSATION_PANEL$NEW_WORKSPACE);
  const showPopover = open && fixedBox !== null;

  const items: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    onSelect: () => void;
  }> = [
    {
      key: "open-project",
      label: t(I18nKey.CONVERSATION_PANEL$OPEN_PROJECT),
      icon: <Folder size={16} aria-hidden />,
      onSelect: () => {
        setOpen(false);
        setDialogSource("workspace");
      },
    },
    {
      key: "open-github-project",
      label: t(I18nKey.CONVERSATION_PANEL$OPEN_GITHUB_PROJECT),
      icon: <Globe size={16} aria-hidden />,
      onSelect: () => {
        setOpen(false);
        setDialogSource("repo");
      },
    },
    {
      key: "quick-start",
      label: t(I18nKey.CONVERSATION_PANEL$QUICK_START),
      icon: <FolderPlus size={16} aria-hidden />,
      onSelect: () => {
        setOpen(false);
        launch();
      },
    },
  ];

  return (
    <div ref={rootRef}>
      <span ref={triggerWrapRef} className="inline-flex">
        <StyledTooltip content={newWorkspaceLabel} placement="bottom">
          <button
            type="button"
            data-testid="conductor-new-workspace-button"
            aria-label={newWorkspaceLabel}
            aria-expanded={open}
            aria-haspopup="menu"
            disabled={isCreating}
            onClick={() => setOpen((value) => !value)}
            className={triggerClassName}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
          </button>
        </StyledTooltip>
      </span>

      {showPopover ? (
        <div
          data-testid="conductor-new-workspace-popover"
          className={cn(NEW_CONVERSATION_DROPDOWN_SURFACE, "w-[240px]")}
          style={{
            position: "fixed",
            top: fixedBox.top,
            left: fixedBox.left,
          }}
        >
          <ul className={dropdownMenuListClassName}>
            {items.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  data-testid={`conductor-new-workspace-${item.key}`}
                  disabled={isCreating}
                  onClick={item.onSelect}
                  className={dropdownMenuRowClassName}
                >
                  <span
                    className={dropdownMenuRowIconWrapperClassName}
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <OpenWorkspaceDialog
        isOpen={dialogOpen}
        initialSource={dialogSource ?? undefined}
        onClose={() => setDialogSource(null)}
        onConfirm={(workspace) => launch(workspace.path)}
      />
    </div>
  );
}
