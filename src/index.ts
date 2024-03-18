import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { collectData, removeRepetition, analyzeData, collectGithubLibs, collectGithubIssues, scanDocs } from './commands'

const DEFAULT_COLLECT_IN_FILE = './out/collected_issues.csv';
const DEFAULT_COLLECT_OUT_FILE = './out/collected_issues.csv';
const DEFAULT_ANALYZE_OUT_FILE = './out/analyzed_issues.csv';
const DEFAULT_START_PAGE = 1;
const DEFAULT_END_PAGE = 1;

const DEFAULT_GH_LIBS_OUT_FILE = './out/github/github_libs/';
const DEFAULT_GH_ISSUES_OUT_DIR = './out/github/github_issues/';

const DEFAULT_DOCS_OUT_DIR = './out/docs/';

const collectGithubData = async (libName: Array<string>, outDir?: string, startPage?: number, endPage?: number) => {
  collectGithubLibs(outDir || DEFAULT_GH_LIBS_OUT_FILE, libName, startPage || DEFAULT_START_PAGE, endPage || DEFAULT_END_PAGE);
}

const collectStackOverflowData = async (outFile?: string, startPage?: number, endPage?: number) => {
  if (!outFile) {
    console.log('No output file specified, using default:', DEFAULT_COLLECT_OUT_FILE);
    outFile = DEFAULT_COLLECT_OUT_FILE;
  }

  if (startPage === undefined) {
    console.log('No start page specified, using default:', DEFAULT_START_PAGE);
    startPage = DEFAULT_START_PAGE;
  }

  if (endPage === undefined) {
    console.log('No end page specified, using default:', DEFAULT_END_PAGE);
    endPage = DEFAULT_END_PAGE;
  }

  collectData(outFile, startPage, endPage).finally(() => {
    outFile && removeRepetition(outFile, 'issue_link');
  })
}

const analyzeGithubData = async (inFile?: string, outFile?: string, startAnalyzeIndex?: number, endAnalyzeIndex?: number) => {}

const analyzeStackOverflowData = async (inFile?: string, outFile?: string, startAnalyzeIndex?: number, endAnalyzeIndex?: number) => {
  console.log('Analyzing data');
  if (!inFile) {
    console.log('No input file specified, using default:', DEFAULT_COLLECT_OUT_FILE);
    inFile = DEFAULT_COLLECT_OUT_FILE;
  }

  if (!outFile) {
    console.log('No output file specified, using default:', DEFAULT_ANALYZE_OUT_FILE);
    outFile = DEFAULT_ANALYZE_OUT_FILE;
  }

  if (startAnalyzeIndex === undefined || endAnalyzeIndex === undefined) {
    throw new Error('Start and end analyze index must be specified');
  }

  analyzeData(inFile, outFile, startAnalyzeIndex, endAnalyzeIndex);
}

const argv = await (yargs(hideBin(process.argv))
  .command('docs', 'Command to scan documentation links', (_yargs) => {
    return _yargs.option('linksFile', {
      alias: 'l',
      type: 'string',
      description: 'File containing links to scan',
    })
    .option('outDir', {
      alias: 'o',
      type: 'string',
      description: 'Output directory',
    })
    .demandOption(['linksFile'])
  }, (argv) => {
    scanDocs(argv.linksFile, argv.outDir || DEFAULT_DOCS_OUT_DIR);
  })
  .command('gh', 'Commands for GitHub', (_yargs) => {
    return _yargs.command('collect', 'Collect data', (_yargs) => {
      return _yargs
      .option('outDir', {
        alias: 'o',
        type: 'string',
        description: 'Output dir',
      })
      .option('inFile', {
        alias: 'i',
        type: 'string',
        description: 'Input file',
      })
      .option('startPage', {
        alias: 's',
        type: 'number',
        description: 'Start page'
      })
      .option('endPage', {
        alias: 'e',
        type: 'number',
        description: 'End page'
      })
      .option('lib-name', {
        alias: 'l',
        type: 'array',
        description: 'Library name',
      }).demandOption('lib-name')
    }, (argv) => collectGithubData(argv.libName as Array<string>, argv.outDir, argv.startPage, argv.endPage))
    .command('collect_issues', 'Collect github issues', (_yargs) => {
      return _yargs
      .option('outDir', {
        alias: 'o',
        type: 'string',
        description: 'Output dir',
      })
      .option('repo-list-file', {
        alias: 'r',
        type: 'string',
        description: 'Library name',
      })
      .demandOption('repo-list-file')
    }, (argv) => collectGithubIssues(argv.repoListFile, argv.outDir || DEFAULT_GH_ISSUES_OUT_DIR))
    .command('analyze', 'Analyze data' , (_yargs) => {
      return _yargs  .option('outFile', {
        alias: 'o',
        type: 'string',
        description: 'Output file',
      })
      .option('inFile', {
        alias: 'i',
        type: 'string',
        description: 'Input file',
      }).option('startAnalyzeIndex', {
        alias: 's',
        type: 'number',
        description: 'Start analyze index'
      })
      .option('endAnalyzeIndex', {
        alias: 'e',
        type: 'number',
        description: 'End analyze index'
      })
    }, (argv) => analyzeGithubData(argv.inFile, argv.outFile, argv.startAnalyzeIndex, argv.endAnalyzeIndex))
  }).command('so', 'Commands for StackOverflow', (_yargs) => {
    return _yargs.command('collect', 'Collect data', (_yargs) => {
      return _yargs.option('outFile', {
        alias: 'o',
        type: 'string',
        description: 'Output file',
      })
      .option('startPage', {
        type: 'number',
        description: 'Start page'
      })
      .option('endPage', {
        type: 'number',
        description: 'End page'
      })
    },
    (argv) => collectStackOverflowData(argv.outFile, argv.startPage, argv.endPage))
    .command('analyze', 'Analyze data' , (_yargs) => {
      return _yargs  .option('outFile', {
        alias: 'o',
        type: 'string',
        description: 'Output file',
      })
      .option('inFile', {
        alias: 'i',
        type: 'string',
        description: 'Input file',
      })
      .option('startAnalyzeIndex', {
        alias: 's',
        type: 'number',
        description: 'Start analyze index'
      })
      .option('endAnalyzeIndex', {
        alias: 'e',
        type: 'number',
        description: 'End analyze index'
      })
    },
    (argv) => analyzeStackOverflowData(argv.inFile, argv.outFile, argv.startAnalyzeIndex, argv.endAnalyzeIndex))
    .command('removeRepetition', 'Remove repetition', (_yargs) => {
      return _yargs.option('inFile', {
        alias: 'i',
        type: 'string',
        description: 'Input file',
      })
    }, (argv) => removeRepetition(argv.inFile || DEFAULT_COLLECT_IN_FILE, 'issue_link'))
  })
  .parse());
