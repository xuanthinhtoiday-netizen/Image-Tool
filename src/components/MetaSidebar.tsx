import React from 'react';
import {
  Compass,
  Heart,
  Image as ImageIcon,
  KeyRound,
  MessageSquarePlus,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import {
  ApiKeys,
  ImagineThread,
  MainView,
  ThemeMode,
} from '../types/studio';
import { MetaHaloLogo } from './MetaHaloLogo';

interface MetaSidebarProps {
  activeView: MainView;
  onViewChange: (view: MainView) => void;
  threads: ImagineThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  totalImages: number;
  favoriteCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  apiKeys: ApiKeys;
  onOpenApiKeys: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export const MetaSidebar: React.FC<MetaSidebarProps> = ({
  activeView,
  onViewChange,
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  totalImages,
  favoriteCount,
  theme,
  onToggleTheme,
  apiKeys,
  onOpenApiKeys,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const configuredKeysCount = Object.values(apiKeys).filter(
    (v) => v.trim().length > 0
  ).length;

  const todayThreads = threads.filter((t) => isToday(t.updatedAt));
  const earlierThreads = threads.filter((t) => !isToday(t.updatedAt));

  const navItems: Array<{
    id: MainView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'imagine',
      label: 'Tưởng tượng',
      icon: <Sparkles className="h-[18px] w-[18px]" />,
    },
    {
      id: 'discover',
      label: 'Khám phá',
      icon: <Compass className="h-[18px] w-[18px]" />,
    },
    {
      id: 'library',
      label: 'Thư viện',
      icon: <ImageIcon className="h-[18px] w-[18px]" />,
      badge: totalImages > 0 ? totalImages : undefined,
    },
    {
      id: 'favorites',
      label: 'Yêu thích',
      icon: <Heart className="h-[18px] w-[18px]" />,
      badge: favoriteCount > 0 ? favoriteCount : undefined,
    },
  ];

  const renderThreadRow = (thread: ImagineThread) => {
    const active = activeView === 'imagine' && activeThreadId === thread.id;
    return (
      <div
        key={thread.id}
        onClick={() => {
          onSelectThread(thread.id);
          onCloseMobile();
        }}
        className={`group flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs transition ${
          active
            ? 'bg-blue-500/14 font-semibold text-blue-500 dark:text-blue-300'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
        }`}
      >
        <span className="truncate">{thread.title}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteThread(thread.id);
          }}
          title="Xóa phiên này"
          className="shrink-0 rounded-md p-1 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    );
  };

  const renderBody = (isCollapsed: boolean) => (
    <div
      className="flex h-full flex-col border-r transition-colors"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Top Brand + Collapse */}
      <div
        className={`flex h-16 items-center px-3.5 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onNewThread();
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 overflow-hidden text-left"
          title="Lumina AI"
        >
          <MetaHaloLogo size="sm" />
          {!isCollapsed && (
            <div className="truncate">
              <div className="font-display text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
                Lumina AI
              </div>
              <div className="text-[10.5px] text-[var(--text-muted)]">
                Imagine Studio
              </div>
            </div>
          )}
        </button>

        {!isCollapsed && (
          <>
            <button
              type="button"
              onClick={onToggleCollapsed}
              title="Thu gọn thanh bên"
              className="hidden h-8 w-8 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] lg:flex"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="mb-2 flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapsed}
            title="Mở rộng thanh bên"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* New Imagine CTA */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            onNewThread();
            onCloseMobile();
          }}
          title="Phiên tưởng tượng mới"
          className={`flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-xs font-semibold transition ${
            isCollapsed ? 'px-0' : 'px-4'
          } border-blue-500/25 bg-blue-500/12 text-blue-500 hover:bg-blue-500/20 dark:text-blue-300`}
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Phiên mới</span>}
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="space-y-1 px-2.5">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onViewChange(item.id);
                onCloseMobile();
              }}
              title={isCollapsed ? item.label : undefined}
              className={`flex w-full items-center rounded-xl py-2.5 text-[13px] font-medium transition ${
                isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
              } ${
                active
                  ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={active ? 'text-blue-500 dark:text-blue-400' : ''}>
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </span>
              {!isCollapsed && item.badge !== undefined && (
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 font-mono-code text-[10.5px] font-semibold text-blue-500 dark:text-blue-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Recent Threads History */}
      {!isCollapsed && (
        <div className="mt-5 flex-1 overflow-y-auto px-3">
          {threads.length > 0 ? (
            <div className="space-y-4">
              {todayThreads.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    Hôm nay
                  </div>
                  <div className="space-y-0.5">
                    {todayThreads.map(renderThreadRow)}
                  </div>
                </div>
              )}

              {earlierThreads.length > 0 && (
                <div>
                  <div className="mb-1.5 px-2 text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    Trước đó
                  </div>
                  <div className="space-y-0.5">
                    {earlierThreads.map(renderThreadRow)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-3.5 text-center">
              <p className="text-[11.5px] leading-relaxed text-[var(--text-muted)]">
                Lịch sử các phiên tạo ảnh của bạn sẽ xuất hiện gọn gàng tại đây.
              </p>
            </div>
          )}
        </div>
      )}

      {isCollapsed && <div className="flex-1" />}

      {/* Bottom Controls: Theme + API Keys */}
      <div
        className="space-y-1.5 border-t p-2.5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Chuyển giao diện Sáng' : 'Chuyển giao diện Tối'}
          className={`flex w-full items-center rounded-xl py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          <span className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500" />
            )}
            {!isCollapsed && (
              <span>{theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenApiKeys}
          title="Cấu hình API Keys"
          className={`flex w-full items-center rounded-xl py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <KeyRound className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            {!isCollapsed && <span>API Keys</span>}
          </span>
          {!isCollapsed && configuredKeysCount > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-mono-code text-[10px] font-semibold text-emerald-500 dark:text-emerald-300">
              {configuredKeysCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 transition-[width] duration-200 lg:block ${
          collapsed ? 'w-[72px]' : 'w-[272px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderBody(collapsed)}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 h-full w-[280px] max-w-[84vw] shadow-2xl">
            {renderBody(false)}
          </aside>
        </div>
      )}
    </>
  );
};
