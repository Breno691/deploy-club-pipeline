// Digital Revenue Intelligence Agent — config

const CONFIG = {
  agent: {
    name:    'Digital Revenue Intelligence Agent',
    version: '1.0.0',
    role:    'Diretor de Receita Digital, Attribution e Growth Finance',
  },

  company: {
    name:      'SmartOps IA',
    location:  'BH/MG',
    ticketDiag: 1500,   // R$ diagnostic
    ticketMin:  3500,   // R$ initial project
    ticketMax: 20000,   // R$ retainer
    ltvTarget: 15000,   // R$ average LTV
  },

  // Revenue targets
  targets: {
    mrr:        50000,  // R$ target MRR
    cac:          500,  // R$ max CAC
    ltv_cac:        3,  // min LTV/CAC ratio
    cpl:          150,  // R$ max cost per lead
    cpm_meeting:  400,  // R$ max cost per meeting
    roas:           4,  // min ROAS
    margin:        60,  // % min margin
    payback:        2,  // months max payback
  },

  // Alert thresholds
  alerts: {
    cac_high:    1000,   // R$ — alert if CAC > this
    roas_low:       2,   // — alert if ROAS < this
    cpl_high:     300,   // R$ — alert if CPL > this
    ltv_cac_low:    2,   // — alert if LTV/CAC < this
    margin_low:    40,   // % — alert if margin < this
    revenue_gap:   60,   // % — alert if month revenue < 60% of target by day 15
  },

  // Channel score thresholds
  channelScore: {
    scale:    { min: 85, label: 'Escalar', action: 'Aumentar orçamento até 20%' },
    maintain: { min: 70, label: 'Manter',  action: 'Otimizar e manter orçamento' },
    monitor:  { min: 50, label: 'Monitorar', action: 'Revisar em 7 dias' },
    cut:      { min: 0,  label: 'Cortar',  action: 'Pausar e reformular' },
  },

  // Budget rules
  budget: {
    maxWeeklyIncreasePercent: 20,
    minTestDays:              7,
    minLeadsBeforeCut:        10,
  },
};

const CHANNELS = [
  'google_ads', 'meta_ads', 'instagram_organic', 'linkedin_organic',
  'seo_organic', 'direct', 'whatsapp', 'partnerships', 'local_prospecting', 'referral',
];

const FUNNEL_STAGES = ['impression', 'click', 'lead', 'qualified_lead', 'meeting', 'proposal', 'client', 'revenue'];

module.exports = { CONFIG, CHANNELS, FUNNEL_STAGES };
