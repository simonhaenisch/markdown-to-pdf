#!/usr/bin/env node

import getPort from 'get-port';
import { Config, defaultConfig, HtmlConfig, PdfConfig } from './lib/config';
import { HtmlOutput, Output, PdfOutput } from './lib/generate-output';
import { getDir } from './lib/helpers';
import { convertMdToPdf } from './lib/md-to-pdf';
import { serveDirectory } from './lib/serve-dir';

type Input = ContentInput | PathInput | PathsInput;

interface ContentInput {
	content: string;
}

interface PathInput {
	path: string;
}

interface PathsInput {
	paths: string[];
}

const hasContent = (input: Input): input is ContentInput => 'content' in input;
const hasPath = (input: Input): input is PathInput => 'path' in input;
const hasPaths = (input: Input): input is PathsInput => 'paths' in input;

/**
 * Convert a markdown file to PDF.
 */
export async function mdToPdf(input: ContentInput | PathInput, config?: Partial<PdfConfig>): Promise<PdfOutput>;
export async function mdToPdf(input: ContentInput | PathInput, config?: Partial<HtmlConfig>): Promise<HtmlOutput>;
export async function mdToPdf(input: PathsInput, config?: Partial<PdfConfig>): Promise<PdfOutput[]>;
export async function mdToPdf(input: PathsInput, config?: Partial<HtmlConfig>): Promise<HtmlOutput[]>;
export async function mdToPdf(input: Input, config: Partial<Config> = {}): Promise<Output | Output[]> {
	if (!hasContent(input) && !hasPath(input) && !hasPaths(input)) {
		throw new Error('The input is missing one of the properties "content", "path" or "paths".');
	}

	if (!config.port) {
		config.port = await getPort();
	}

	if (!config.basedir) {
		config.basedir = 'path' in input ? getDir(input.path) : process.cwd();
	}

	if (hasPaths(input) && config.dest) {
		console.warn('WARNING: config.dest will be ignored when converting multiple files.');
	}

	if (!config.dest || hasPaths(input)) {
		config.dest = '';
	}

	const mergedConfig: Config = {
		...defaultConfig,
		...config,
		pdf_options: { ...defaultConfig.pdf_options, ...config.pdf_options },
	};

	const server = await serveDirectory(mergedConfig);

	const result =
		hasContent(input) || hasPath(input)
			? await convertMdToPdf(input, mergedConfig)
			: await Promise.all(input.paths.map(async (path) => convertMdToPdf({ path }, mergedConfig)));

	server.close();

	return result;
}

export default mdToPdf;

export interface PackageJson {
	engines: {
		node: string;
	};
	version: string;
}
