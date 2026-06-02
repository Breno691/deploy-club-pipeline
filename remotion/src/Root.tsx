import React from 'react';
import { Composition } from 'remotion';
import { AdVideo, AdVideoSchema } from './compositions/AdVideo';
import { LeanWasteTemplate }     from './templates/LeanWasteTemplate';
import { AutomationTemplate }    from './templates/AutomationTemplate';
import { CaseStudyTemplate, buildCaseStudyProject }       from './templates/CaseStudyTemplate';
import { AuthorityTemplate, buildAuthorityProject }       from './templates/AuthorityTemplate';
import { VideoAdTemplate, buildVideoAdProject }           from './templates/VideoAdTemplate';
import { SixSigmaTemplate, buildSixSigmaProject }         from './templates/SixSigmaTemplate';
import { LocalBusinessTemplate, buildLocalBusinessProject } from './templates/LocalBusinessTemplate';
// ── Novos templates — 14 estilos visuais distintos (tendências 2025-2026)
import { GradientHeroTemplate, buildGradientHeroProject } from './templates/GradientHeroTemplate';
import { NeonCyberTemplate, buildNeonCyberProject }       from './templates/NeonCyberTemplate';
import { MinimalistLightTemplate, buildMinimalistProject } from './templates/MinimalistLightTemplate';
import { KineticStatsTemplate, buildKineticStatsProject } from './templates/KineticStatsTemplate';
import { HUDDataTemplate, buildHUDDataProject }           from './templates/HUDDataTemplate';
import { GlassmorphismTemplate, buildGlassProject }       from './templates/GlassmorphismTemplate';
import { BentoGridTemplate, buildBentoProject }           from './templates/BentoGridTemplate';
import { KineticDataTemplate, buildKineticDataProject }   from './templates/KineticDataTemplate';
import { NeoBrutalTemplate, buildBrutProject }            from './templates/NeoBrutalTemplate';
import { SynthwaveTemplate, buildSynthwaveProject }       from './templates/SynthwaveTemplate';
import { AuroraTemplate, buildAuroraProject }             from './templates/AuroraTemplate';
import { BoldTypoTemplate, buildTypoProject }             from './templates/BoldTypoTemplate';
import { RetroSpaceTemplate, buildRetroSpaceProject }     from './templates/RetroSpaceTemplate';
import { PodcastWordTemplate, buildPodProject }           from './templates/PodcastWordTemplate';
// ── Templates v2 — Dinâmico · Leve · Atraente
import { VividFlowTemplate, buildVividFlowProject }       from './templates/VividFlowTemplate';
import { ImpactPosterTemplate, buildPosterProject }       from './templates/ImpactPosterTemplate';
import { DriftTemplate, buildDriftProject }               from './templates/DriftTemplate';
// ── Integrações externas: Lottie, D3, React Three Fiber
import { LottieTemplate }   from './templates/LottieTemplate';
import { D3DataTemplate }   from './templates/D3DataTemplate';
import { ThreeDTemplate }   from './templates/ThreeDTemplate';
import type { z } from 'zod';

type AdVideoProps = z.infer<typeof AdVideoSchema>;

// Default scene props — SmartOps IA Campaign (30s Reels)
const DEFAULT_PROPS: AdVideoProps = {
  style: 'problem_solution',
  duration: 30,
  platform: 'instagram_reels',
  service: 'lean_six_sigma',
  scenes: [
    { type: 'hook',    text: 'Quanto sua empresa perde todo mês sem perceber?', duration: 4 },
    { type: 'problem', text: 'Retrabalho. Improviso. WhatsApp caótico. Estoque parado.', duration: 5 },
    { type: 'product', text: 'SmartOps IA identifica e elimina esses desperdícios em 4 semanas.', duration: 6 },
    { type: 'benefit', text: '−30% custo operacional\nProcessos padronizados e automatizados\nLean Six Sigma + IA aplicados na sua PME', duration: 8 },
    { type: 'cta',     text: 'Diagnóstico Gratuito', subtext: 'smartops-ia.com.br · Black Belt BH/MG', duration: 7 },
  ],
};

// 15s — versão curta para feed
const SHORT_PROPS: AdVideoProps = {
  style: 'direct_offer',
  duration: 15,
  platform: 'instagram_reels',
  service: 'lean_six_sigma',
  scenes: [
    { type: 'hook',    text: 'R$47mil desperdiçados por mês na sua PME.', duration: 4 },
    { type: 'product', text: 'SmartOps IA elimina isso. 4 semanas. −30% custo garantido.', duration: 5 },
    { type: 'cta',     text: 'Diagnóstico Grátis — 30 min', subtext: 'smartops-ia.com.br · Presencial BH/MG', duration: 6 },
  ],
};

const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  instagram_reels: { width: 1080, height: 1920 },
  youtube_shorts: { width: 1080, height: 1920 },
  instagram_square: { width: 1080, height: 1080 },
  tiktok: { width: 1080, height: 1920 },
};

export const RemotionRoot: React.FC = () => {
  const dims = PLATFORM_DIMENSIONS[DEFAULT_PROPS.platform] || { width: 1080, height: 1920 };

  return (
    <>
      <Composition
        id="AdVideo30s"
        component={AdVideo}
        durationInFrames={DEFAULT_PROPS.duration * 30}
        fps={30}
        width={dims.width}
        height={dims.height}
        defaultProps={DEFAULT_PROPS}
        schema={AdVideoSchema}
      />
      <Composition
        id="AdVideo15s"
        component={AdVideo}
        durationInFrames={SHORT_PROPS.duration * 30}
        fps={30}
        width={dims.width}
        height={dims.height}
        defaultProps={SHORT_PROPS}
        schema={AdVideoSchema}
      />

      {/* JSON-driven templates */}
      <Composition
        id="LeanWaste35s"
        component={LeanWasteTemplate}
        durationInFrames={35 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ theme: 'retrabalho', audience: 'Donos de PMEs em BH/MG' }}
      />

      <Composition
        id="Automation30s"
        component={AutomationTemplate}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ theme: 'automação', audience: 'Donos de PMEs em BH/MG' }}
      />

      <Composition
        id="CaseStudy40s"
        component={CaseStudyTemplate}
        durationInFrames={40 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ project: buildCaseStudyProject() }}
      />

      <Composition
        id="Authority35s"
        component={AuthorityTemplate}
        durationInFrames={35 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ project: buildAuthorityProject() }}
      />

      <Composition
        id="VideoAd30s"
        component={VideoAdTemplate}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ project: buildVideoAdProject() }}
      />

      <Composition
        id="SixSigma40s"
        component={SixSigmaTemplate}
        durationInFrames={40 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ project: buildSixSigmaProject() }}
      />

      <Composition
        id="LocalBusiness35s"
        component={LocalBusinessTemplate}
        durationInFrames={35 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ project: buildLocalBusinessProject() }}
      />

      {/* ══════════════════════════════════════════════════════════
          NOVOS TEMPLATES — 14 ESTILOS VISUAIS DISTINTOS
          Baseados em pesquisa de tendências 2025-2026
          ══════════════════════════════════════════════════════════ */}

      {/* 01. Gradiente bold azul/roxo + orbs + tipografia 155px */}
      <Composition id="GradientHero30s"     component={GradientHeroTemplate}   durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildGradientHeroProject() }} />

      {/* 02. Neon-Noir: preto + neon vermelho/ciano + CCTV grid + glitch */}
      <Composition id="NeonCyber30s"        component={NeonCyberTemplate}       durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildNeonCyberProject() }} />

      {/* 03. Editorial off-white + tipografia preta bold + Apple-style */}
      <Composition id="MinimalistLight35s"  component={MinimalistLightTemplate} durationInFrames={35*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildMinimalistProject() }} />

      {/* 04. Split-screen laranja/dark + contadores animados + scan line */}
      <Composition id="KineticStats30s"     component={KineticStatsTemplate}    durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildKineticStatsProject() }} />

      {/* 05. HUD / Cockpit — ciano elétrico + verde neon + barras de progresso */}
      <Composition id="HUDData30s"          component={HUDDataTemplate}         durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildHUDDataProject() }} />

      {/* 06. Glassmorphism Cool — gradiente azul/roxo + cards vidro fosco */}
      <Composition id="GlassCool30s"        component={GlassmorphismTemplate}   durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildGlassProject('cool') }} />

      {/* 07. Glassmorphism Warm — gradiente rosa/laranja + cards vidro fosco */}
      <Composition id="GlassWarm30s"        component={GlassmorphismTemplate}   durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildGlassProject('warm') }} />

      {/* 08. Bento Grid Dark — layout Apple/Vercel/Linear, cards sequenciais */}
      <Composition id="BentoDark25s"        component={BentoGridTemplate}       durationInFrames={25*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildBentoProject('dark') }} />

      {/* 09. Bento Grid Light — mesmo layout, fundo claro Apple */}
      <Composition id="BentoLight25s"       component={BentoGridTemplate}       durationInFrames={25*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildBentoProject('light') }} />

      {/* 10. Kinetic Data — gráficos de barras + antes/depois + número 220px */}
      <Composition id="KineticData32s"      component={KineticDataTemplate}     durationInFrames={32*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildKineticDataProject() }} />

      {/* 11. Neo-Brutal Amarelo — bordas pretas grossas + sombra offset */}
      <Composition id="NeoBrutYellow30s"    component={NeoBrutalTemplate}       durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildBrutProject('yellow') }} />

      {/* 12. Neo-Brutal Rosa — mesma estética, fundo pink choque */}
      <Composition id="NeoBrutPink30s"      component={NeoBrutalTemplate}       durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildBrutProject('pink') }} />

      {/* 13. Neo-Brutal Laranja — fundo laranja intenso + azul marinho */}
      <Composition id="NeoBrutOrange30s"    component={NeoBrutalTemplate}       durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildBrutProject('orange') }} />

      {/* 14. Synthwave — grade perspectiva roxa + sol retro + magenta/ciano */}
      <Composition id="Synthwave23s"        component={SynthwaveTemplate}       durationInFrames={23*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildSynthwaveProject() }} />

      {/* 15. Aurora — gradiente mesh iridescente multi-cor holográfico */}
      <Composition id="Aurora30s"           component={AuroraTemplate}          durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildAuroraProject() }} />

      {/* 16. Bold Typo Black — palavra gigante 240px, cinética agressiva */}
      <Composition id="BoldTypoBlack"       component={BoldTypoTemplate}        durationInFrames={33*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildTypoProject('black') }} />

      {/* 17. Bold Typo White — mesma cinematica, fundo branco + azul */}
      <Composition id="BoldTypoWhite"       component={BoldTypoTemplate}        durationInFrames={33*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildTypoProject('white') }} />

      {/* 18. Retro Space — cosmos art deco + planetas + tipografia Space Age */}
      <Composition id="RetroSpace23s"       component={RetroSpaceTemplate}      durationInFrames={23*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildRetroSpaceProject() }} />

      {/* 19. Podcast Word Dark — palavra por palavra, Alex Hormozi style */}
      <Composition id="PodcastDark19s"      component={PodcastWordTemplate}     durationInFrames={22*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildPodProject('dark') }} />

      {/* 20. Podcast Word Purple — mesmo estilo, tema roxo premium */}
      <Composition id="PodcastPurple19s"    component={PodcastWordTemplate}     durationInFrames={22*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildPodProject('purple') }} />

      {/* 21. Podcast Word Red — mesmo estilo, tema vermelho energia */}
      <Composition id="PodcastRed19s"       component={PodcastWordTemplate}     durationInFrames={22*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildPodProject('red') }} />

      {/* ══════════════════════════════════════════════════════════
          V2 — DINÂMICO · LEVE · ATRAENTE
          Letras animadas individualmente · Backgrounds em movimento
          ══════════════════════════════════════════════════════════ */}

      {/* 22. VividFlow — fundo colorido em fluxo, letras em cascata, glassmorphism */}
      <Composition id="VividFlow30s"        component={VividFlowTemplate}       durationInFrames={30*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildVividFlowProject() }} />

      {/* 23. ImpactPoster Blue — stamp effect, blocos alternados, azul elétrico */}
      <Composition id="PosterBlue35s"       component={ImpactPosterTemplate}    durationInFrames={35*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildPosterProject('blue') }} />

      {/* 24. ImpactPoster Green — mesmo ritmo de clipe, verde neon */}
      <Composition id="PosterGreen35s"      component={ImpactPosterTemplate}    durationInFrames={35*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildPosterProject('green') }} />

      {/* 25. ImpactPoster Red — energia vermelha intensa */}
      <Composition id="PosterRed35s"        component={ImpactPosterTemplate}    durationInFrames={35*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildPosterProject('red') }} />

      {/* 26. Drift Indigo — shapes geométricas derivando, texto linha a linha, elegante */}
      <Composition id="DriftIndigo29s"      component={DriftTemplate}           durationInFrames={29*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildDriftProject('indigo') }} />

      {/* 27. Drift Teal — mesmo estilo refinado, tons esmeralda/teal */}
      <Composition id="DriftTeal29s"        component={DriftTemplate}           durationInFrames={29*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildDriftProject('teal') }} />

      {/* 28. Drift Rose — tons rose/vermelho, mais emocional */}
      <Composition id="DriftRose29s"        component={DriftTemplate}           durationInFrames={29*30} fps={30} width={1080} height={1920} defaultProps={{ project: buildDriftProject('rose') }} />

      {/* ══════════════════════════════════════════════════════════
          INTEGRAÇÕES EXTERNAS
          LottieFiles · D3.js · React Three Fiber
          ══════════════════════════════════════════════════════════ */}

      {/* 29. LottieFiles — animações Lottie de ícones com micro-motion */}
      <Composition id="LottieIcons35s"      component={LottieTemplate}          durationInFrames={35*30} fps={30} width={1080} height={1920} defaultProps={{}} />

      {/* 30. D3 Data — bar chart + line chart + donut chart animados */}
      <Composition id="D3DataStory38s"      component={D3DataTemplate}          durationInFrames={38*30} fps={30} width={1080} height={1920} defaultProps={{}} />

      {/* 31. React Three Fiber — esfera 3D girando + partículas + cubos */}
      <Composition id="ThreeD3D36s"         component={ThreeDTemplate}          durationInFrames={36*30} fps={30} width={1080} height={1920} defaultProps={{}} />
    </>
  );
};
