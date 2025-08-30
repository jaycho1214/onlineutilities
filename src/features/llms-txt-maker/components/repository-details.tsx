/**
 * Repository Details Component
 * Displays information about the loaded GitHub repository
 */

"use client";

import React from "react";
import {
  Star,
  GitFork,
  Calendar,
  ExternalLink,
  Archive,
  Lock,
  Code,
} from "lucide-react";
import { GitHubIcon } from "./github-icon";
import { useTranslations } from "next-intl";
import { Badge } from "@/features/shared/ui/badge";
import { Button } from "@/features/shared/ui/button";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { useLlmsTxtMaker } from "../lib/llms-txt-maker-context";

export function RepositoryDetails() {
  const t = useTranslations("GitHubToLlmsTxt");
  const { state } = useLlmsTxtMaker();

  if (!state.repository) return null;

  const { repository } = state;

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <GlassSurface className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
              <GitHubIcon className="size-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {repository.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{repository.owner}</span>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span className="font-medium">{repository.name}</span>
              </p>
            </div>
          </div>

          {/* External Link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(repository.htmlUrl, "_blank")}
            className="flex-shrink-0"
          >
            <ExternalLink className="size-4" />
          </Button>
        </div>

        {/* Repository Status Badges */}
        <div className="flex flex-wrap gap-2">
          {repository.isPrivate && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="size-3 mr-1" />
              {t("repository.private")}
            </Badge>
          )}
          {repository.isArchived && (
            <Badge variant="destructive" className="text-xs">
              <Archive className="size-3 mr-1" />
              {t("repository.archived")}
            </Badge>
          )}
          {repository.language && (
            <Badge variant="outline" className="text-xs">
              <Code className="size-3 mr-1" />
              {repository.language}
            </Badge>
          )}
        </div>

        {/* Description */}
        {repository.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {repository.description}
          </p>
        )}

        {!repository.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            {t("repository.noDescription")}
          </p>
        )}

        {/* Repository Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
              <Star className="size-4" />
              <span className="font-medium">
                {formatCount(repository.stars)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("repository.stars")}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
              <GitFork className="size-4" />
              <span className="font-medium">
                {formatCount(repository.forks)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("repository.forks")}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
              <GitHubIcon className="size-4" />
              <span className="font-medium">{repository.totalFiles}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Files
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
              <Calendar className="size-4" />
              <span className="font-medium text-xs">
                {formatDate(repository.lastUpdated)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("repository.lastUpdated")}
            </p>
          </div>
        </div>

        {/* File Summary */}
        <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">
              {t("files.totalFiles", { count: repository.totalFiles })}
            </span>
            {state.selectedFiles.size > 0 && (
              <>
                <span className="text-gray-400 dark:text-gray-500"> • </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {t("files.selectedFiles", {
                    count: state.selectedFiles.size,
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </GlassSurface>
  );
}
