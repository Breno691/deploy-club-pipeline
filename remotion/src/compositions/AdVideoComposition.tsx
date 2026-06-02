import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { VideoProject, VideoScene } from '../data/video.schema';
import { HookScene }     from '../scenes/HookScene';
import { ProblemScene }  from '../scenes/ProblemScene';
import { DataScene }     from '../scenes/DataScene';
import { SolutionScene } from '../scenes/SolutionScene';
import { CTAScene }      from '../scenes/CTAScene';
import { colors }        from '../brand/brandTokens';

interface Props {
  project: VideoProject;
}

// Route a VideoScene to the correct scene component
const SceneRouter: React.FC<{
  scene:       VideoScene;
  frame:       number;
  totalFrames: number;
  fps:         number;
  project:     VideoProject;
}> = ({ scene, frame, totalFrames, fps, project }) => {
  const common = { scene, frame, totalFrames, fps };

  switch (scene.type) {
    case 'hook':        return <HookScene     {...common} />;
    case 'problem':
    case 'pain':        return <ProblemScene  {...common} />;
    case 'data':
    case 'insight':     return <DataScene     {...common} />;
    case 'solution':
    case 'process':     return <SolutionScene {...common} />;
    case 'cta':
    case 'outro':       return <CTAScene      {...common} cta={project.cta} />;
    case 'before_after':
    case 'case_result': return <DataScene     {...common} />;
    case 'testimonial': return <HookScene     {...common} />;
    default:            return <HookScene     {...common} />;
  }
};

export const AdVideoComposition: React.FC<Props> = ({ project }) => {
  const { fps } = useVideoConfig();
  const frame    = useCurrentFrame();

  // Build per-scene frame ranges
  const ranges = project.scenes.reduce<{ start: number; end: number; scene: VideoScene }[]>(
    (acc, scene) => {
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      return [...acc, { start, end: start + scene.duration * fps, scene }];
    },
    [],
  );

  const current = ranges.find(r => frame >= r.start && frame < r.end)
    ?? ranges[ranges.length - 1];

  const sceneFrame  = frame - current.start;
  const sceneFrames = current.scene.duration * fps;

  return (
    <AbsoluteFill style={{ background: colors.background, overflow: 'hidden' }}>
      <SceneRouter
        scene={current.scene}
        frame={sceneFrame}
        totalFrames={sceneFrames}
        fps={fps}
        project={project}
      />
    </AbsoluteFill>
  );
};
