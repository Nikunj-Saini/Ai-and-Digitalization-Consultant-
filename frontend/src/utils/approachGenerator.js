import { Database, Cpu, Zap, Layers, RefreshCw, BarChart2, Server, Workflow } from 'lucide-react';

/**
 * Categorizes active tools into architectural layers
 */
export function categorizeTools(activeTools = []) {
  const tools = Array.isArray(activeTools) ? activeTools : [];
  
  const categories = {
    ingestion: [],
    processing: [],
    automation: [],
    database: [],
    analytics: [],
    integration: [],
    other: []
  };

  tools.forEach(t => {
    const lower = t.toLowerCase();
    if (
      lower.includes('prophet') || lower.includes('xgboost') || lower.includes('scikit') ||
      lower.includes('statsmodels') || lower.includes('torch') || lower.includes('tensorflow') ||
      lower.includes('pandas') || lower.includes('numpy')
    ) {
      categories.processing.push(t);
    } else if (
      lower.includes('textract') || lower.includes('ocr') || lower.includes('document ai') ||
      lower.includes('flexicapture') || lower.includes('pdfplumber') || lower.includes('pypdf')
    ) {
      categories.ingestion.push(t);
    } else if (
      lower.includes('power bi') || lower.includes('tableau') || lower.includes('grafana') ||
      lower.includes('looker') || lower.includes('metabase')
    ) {
      categories.analytics.push(t);
    } else if (
      lower.includes('uipath') || lower.includes('power automate') || lower.includes('automation anywhere') ||
      lower.includes('zapier') || lower.includes('make') || lower.includes('celery') || lower.includes('airflow')
    ) {
      categories.automation.push(t);
    } else if (
      lower.includes('postgresql') || lower.includes('postgres') || lower.includes('snowflake') ||
      lower.includes('bigquery') || lower.includes('redshift') || lower.includes('duckdb') ||
      lower.includes('sql') || lower.includes('mysql') || lower.includes('mongodb') ||
      lower.includes('redis') || lower.includes('dynamodb')
    ) {
      categories.database.push(t);
    } else if (
      lower.includes('sap') || lower.includes('tally') || lower.includes('salesforce') ||
      lower.includes('api') || lower.includes('rest') || lower.includes('fastapi') ||
      lower.includes('express') || lower.includes('node') || lower.includes('graphql')
    ) {
      categories.integration.push(t);
    } else if (lower.includes('python') || lower.includes('typescript') || lower.includes('javascript') || lower.includes('java')) {
      categories.processing.push(t);
    } else {
      categories.other.push(t);
    }
  });

  return categories;
}

/**
 * Generates dynamic flowchart workflow steps tailored specifically for each solution tier and tech stack.
 */
export function getDynamicFlowchartSteps(sol, activeTools = [], index = 0) {
  const tools = (activeTools && activeTools.length > 0) ? activeTools : (sol?.tools || []);
  const categories = categorizeTools(tools);

  // Determine solution tier strictly based on index or specific tier markers
  const tier = (typeof index === 'number' && index >= 0)
    ? (index === 0 ? 1 : index === 2 ? 3 : 2)
    : (
        ((sol?.title && (sol.title.toLowerCase().includes('enterprise') || sol.title.toLowerCase().includes('suite'))) || sol?.cost_tier?.includes('$$$')) ? 3 :
        ((sol?.title && (sol.title.toLowerCase().includes('script') || sol.title.toLowerCase().includes('lightweight') || sol.title.toLowerCase().includes('baseline'))) || sol?.effort?.includes('1-2')) ? 1 : 2
      );

  const isOption1 = tier === 1;
  const isOption3 = tier === 3;
  
  const steps = [];

  const isForecasting = categories.processing.some(t => {
    const l = t.toLowerCase();
    return l.includes('prophet') || l.includes('xgboost') || l.includes('pandas') || l.includes('statsmodels');
  }) || (sol?.title && sol.title.toLowerCase().includes('forecast'));

  if (isForecasting) {
    const dataPrepTool = categories.database[0] || (categories.processing.find(t => t.toLowerCase().includes('pandas')) || tools[0] || 'SQL/Data Prep');
    const mlEngineTool = categories.processing.find(t => t.toLowerCase().includes('prophet') || t.toLowerCase().includes('xgboost') || t.toLowerCase().includes('scikit') || t.toLowerCase().includes('python')) || 'Predictive Engine';
    const outputTool = categories.analytics[0] || categories.integration[0] || categories.database[1] || 'Dashboard / BI';

    if (isOption1) {
      steps.push({
        step: '01',
        title: 'Historical Data Ingestion',
        desc: `Extract historical operational logs and demand patterns using ${dataPrepTool}.`,
        badge: dataPrepTool,
        icon: Database
      });
      steps.push({
        step: '02',
        title: 'Baseline Forecasting Engine',
        desc: `Generate baseline trend projections and moving averages via ${mlEngineTool}.`,
        badge: mlEngineTool,
        icon: Cpu
      });
      steps.push({
        step: '03',
        title: 'Capacity Summary View',
        desc: `Export monthly staffing and resource projections into ${outputTool}.`,
        badge: outputTool,
        icon: Zap
      });
    } else if (isOption3) {
      const dbBadge = categories.database.join(' + ') || dataPrepTool;
      const mlBadge = categories.processing.join(' + ') || mlEngineTool;
      const intBadge = [categories.analytics[0], categories.integration[0]].filter(Boolean).join(' + ') || outputTool;

      steps.push({
        step: '01',
        title: 'Enterprise Lakehouse & Feature Store',
        desc: `Automated feature pipelines, seasonality indicators, and clean telemetry via ${dbBadge}.`,
        badge: dbBadge,
        icon: Database
      });
      steps.push({
        step: '02',
        title: 'Ensemble ML & Simulation Engine',
        desc: `Multi-model demand forecasting, what-if scenario simulations, and MAPE monitoring with ${mlBadge}.`,
        badge: mlBadge,
        icon: Cpu
      });
      steps.push({
        step: '03',
        title: 'Automated Alerting & Executive BI',
        desc: `Real-time spike/shortage triggers, automated staffing plans, and C-level reporting via ${intBadge}.`,
        badge: intBadge,
        icon: Zap
      });
    } else {
      steps.push({
        step: '01',
        title: 'Automated Data Pipeline',
        desc: `Scheduled ETL and data cleansing pipeline connected to ${dataPrepTool}.`,
        badge: dataPrepTool,
        icon: Database
      });
      steps.push({
        step: '02',
        title: 'ML Forecasting & Capacity Modeling',
        desc: `Train seasonal forecasting models with error tracking (MAPE) in ${mlEngineTool}.`,
        badge: mlEngineTool,
        icon: Cpu
      });
      steps.push({
        step: '03',
        title: 'Capacity Allocation & Alerts',
        desc: `Publish proactive overcapacity and shortage recommendations into ${outputTool}.`,
        badge: outputTool,
        icon: Zap
      });
    }
    return steps;
  }

  // General / Document / Workflow Automation Flow
  const mainIngest = categories.ingestion.length > 0 ? categories.ingestion[0] : (categories.database[0] || tools[0] || 'Data Intake');
  const mainAuto = (categories.processing.length > 0 ? categories.processing[0] : (categories.automation[0] || tools[1] || tools[0] || 'Core Engine'));
  const mainInt = categories.integration.length > 0 ? categories.integration.join(', ') : (categories.analytics[0] || categories.database[1] || tools[tools.length - 1] || 'Target System');

  if (isOption1) {
    steps.push({
      step: '01',
      title: 'Lightweight Intake & Parse',
      desc: `Direct data ingestion and format parsing via ${mainIngest}.`,
      badge: mainIngest,
      icon: Database
    });
    steps.push({
      step: '02',
      title: 'Scripted Processing Engine',
      desc: `Run lightweight ${mainAuto} extraction and business logic validation.`,
      badge: mainAuto,
      icon: Cpu
    });
    steps.push({
      step: '03',
      title: 'Direct Output & Sync',
      desc: `Direct data injection and target synchronization via ${mainInt}.`,
      badge: mainInt,
      icon: Zap
    });
  } else if (isOption3) {
    const ingestBadges = categories.ingestion.length > 0 ? categories.ingestion.join(' + ') : mainIngest;

    steps.push({
      step: '01',
      title: 'Enterprise Multi-Channel Gateway',
      desc: `High-throughput intake gateway with validation using ${ingestBadges}.`,
      badge: ingestBadges,
      icon: Database
    });
    steps.push({
      step: '02',
      title: 'Enterprise Orchestration & Audit',
      desc: `Multi-tenant ${mainAuto} workflow engine with security and audit trails.`,
      badge: mainAuto,
      icon: Cpu
    });
    steps.push({
      step: '03',
      title: 'Enterprise Integration & Analytics',
      desc: `Two-way automated sync and real-time executive dashboarding via ${mainInt}.`,
      badge: mainInt,
      icon: Zap
    });
  } else {
    steps.push({
      step: '01',
      title: 'Automated Ingestion Pipeline',
      desc: `Queue-based data intake and pre-processing via ${mainIngest}.`,
      badge: mainIngest,
      icon: Database
    });
    steps.push({
      step: '02',
      title: 'Core Validation Engine',
      desc: `Automated duplicate checks, business rule evaluation, and workflow in ${mainAuto}.`,
      badge: mainAuto,
      icon: Cpu
    });
    steps.push({
      step: '03',
      title: 'Automated Sync & Webhooks',
      desc: `Scheduled batch synchronization and status callbacks via ${mainInt}.`,
      badge: mainInt,
      icon: Zap
    });
  }

  return steps;
}

/**
 * Generates dynamic implementation methodology bullet points for Stage 4 Deep Analysis View.
 */
export function getDynamicImplementationApproach(analysis, activeTools = []) {
  const tools = (activeTools && activeTools.length > 0) ? activeTools : [];
  if (tools.length === 0) return analysis?.implementation_approach || '';

  const categories = categorizeTools(tools);
  const steps = [];

  // Phase 1: Ingestion Architecture
  const ingestStr = categories.ingestion.length > 0 ? categories.ingestion.join(', ') : 'Standard Data Connectors';
  steps.push(`1. Ingestion & Document Processing: Deploy ${ingestStr} to capture incoming enterprise data streams, parse file formats, and extract key entities.`);

  // Phase 2: Processing & Automation Logic
  const autoStr = categories.automation.length > 0 ? categories.automation.join(' & ') : 'Custom Microservices';
  steps.push(`2. Workflow Automation Engine: Configure ${autoStr} bot handlers to execute business decision logic, exception handling, and automated processing.`);

  // Phase 3: Database & Warehousing (if present)
  if (categories.database.length > 0) {
    steps.push(`3. Data Persistence & Analytics Store: Provision ${categories.database.join(' and ')} to maintain relational integrity, history tracking, and high-throughput queries.`);
  }

  // Phase 4: Enterprise Integration & Reporting
  const intStr = categories.integration.length > 0 ? categories.integration.join(' + ') : 'REST Enterprise Endpoints';
  steps.push(`${steps.length + 1}. Enterprise Integration & Dashboarding: Establish automated connectors using ${intStr} for real-time data sync and executive monitoring.`);

  return steps.join('\n\n');
}
