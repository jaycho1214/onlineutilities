/**
 * llms.txt Maker Main Page Component
 * Orchestrates the complete llms.txt generation workflow
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useLlmsTxtMaker } from "../lib/llms-txt-maker-context";
import { RepositoryInput } from "../components/repository-input";
import { RepositoryDetails } from "../components/repository-details";
import { FileSelection } from "../components/file-selection";
import { LlmsTxtGenerator } from "../components/llms-txt-generator";

export function LlmsTxtMakerPage() {
  const { state } = useLlmsTxtMaker();
  const t = useTranslations("GitHubToLlmsTxt");

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Repository Input */}
        <RepositoryInput />

        {/* Repository Details */}
        {state.repository && <RepositoryDetails />}

        {/* Content Grid */}
        {state.repository && (
          <div className="grid lg:grid-cols-2 gap-6 w-full overflow-hidden">
            {/* File Selection */}
            <div className="lg:col-span-1 min-w-0">
              <FileSelection />
            </div>

            {/* Generator */}
            <div className="lg:col-span-1 min-w-0">
              <LlmsTxtGenerator />
            </div>
          </div>
        )}

        {/* Welcome State */}
        {!state.repository && !state.loading.isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Get Started
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Enter a GitHub repository URL above to begin generating your
                llms.txt file.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">📁</div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Select Files
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Choose which files to include in your llms.txt
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2">⚙️</div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Configure
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Customize the format and content options
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
                <div className="text-2xl mb-2">📄</div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Generate
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Create and download your llms.txt file
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
