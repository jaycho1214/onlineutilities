/**
 * Repository Input Component
 * Handles GitHub repository URL input with validation and fetching
 */

"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { GitHubIcon } from "./github-icon";
import { useTranslations } from "next-intl";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { Label } from "@/features/shared/ui/label";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { useLlmsTxtMaker } from "../lib/llms-txt-maker-context";
import { validateGitHubUrl, extractRepoInfo } from "../lib/github-api";

export function RepositoryInput() {
  const t = useTranslations("GitHubToLlmsTxt");
  const { state, setRepositoryUrl, loadRepository } = useLlmsTxtMaker();
  const [inputValue, setInputValue] = useState(state.repositoryUrl);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Update state but don't validate yet
    if (value !== state.repositoryUrl) {
      setRepositoryUrl(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = inputValue.trim();
    if (!url) return;

    await loadRepository(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const isValidUrl = inputValue.trim()
    ? validateGitHubUrl(inputValue.trim())
    : true;
  const repoInfo = inputValue.trim()
    ? extractRepoInfo(inputValue.trim())
    : null;

  return (
    <GlassSurface className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
            <GitHubIcon className="size-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("input.repositoryUrl")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("input.repositoryUrlDescription")}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repository-url">{t("input.repositoryUrl")}</Label>
            <div className="relative">
              <Input
                id="repository-url"
                type="text"
                placeholder={t("input.repositoryUrlPlaceholder")}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={state.loading.isLoading}
                className={`pr-10 ${!isValidUrl ? "border-red-300 dark:border-red-700" : ""}`}
              />
              {!isValidUrl && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="size-4 text-red-500" />
                </div>
              )}
            </div>

            {/* URL Validation */}
            {!isValidUrl && inputValue.trim() && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="size-3" />
                {t("errors.invalidUrl")}
              </p>
            )}

            {/* Repository Info Preview */}
            {repoInfo && isValidUrl && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{repoInfo.owner}</span>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span className="font-medium">{repoInfo.repo}</span>
              </div>
            )}
          </div>

          {/* Load Button */}
          <Button
            type="submit"
            variant="action"
            size="default"
            disabled={
              !inputValue.trim() || !isValidUrl || state.loading.isLoading
            }
            className="w-full"
          >
            {state.loading.isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {state.loading.loadingMessage || t("input.loading")}
              </>
            ) : (
              <>
                <GitHubIcon className="size-4 mr-2" />
                {t("input.loadRepository")}
              </>
            )}
          </Button>
        </form>

        {/* Error Display */}
        {state.error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-300">
                  {t("input.fetchFailed")}
                </p>
                <p className="text-red-700 dark:text-red-400 mt-1">
                  {state.error.message}
                </p>

                {/* Rate limit specific message */}
                {state.error.type === "RATE_LIMITED" &&
                  state.error.rateLimitReset && (
                    <p className="text-red-600 dark:text-red-400 mt-1 text-xs">
                      Rate limit resets at:{" "}
                      {new Date(
                        state.error.rateLimitReset,
                      ).toLocaleTimeString()}
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Progress */}
        {state.loading.isLoading && state.loading.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{state.loading.loadingMessage}</span>
              <span>{state.loading.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${state.loading.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </GlassSurface>
  );
}
