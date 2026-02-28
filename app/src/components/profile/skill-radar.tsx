import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SkillAxis {
  label: string;
  value: number;
}

interface SkillRadarProps {
  skills: SkillAxis[];
  maxValue?: number;
  className?: string;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 90;
const RINGS = 4;

function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export function SkillRadar({ skills, maxValue = 100, className }: SkillRadarProps) {
  const angleStep = 360 / skills.length;

  const ringPaths = Array.from({ length: RINGS }, (_, ring) => {
    const r = (RADIUS / RINGS) * (ring + 1);
    const points = skills.map((_, i) => {
      const p = polarToCartesian(i * angleStep, r);
      return `${p.x},${p.y}`;
    });
    return points.join(' ');
  });

  const dataPoints = skills.map((skill, i) => {
    const r = (skill.value / maxValue) * RADIUS;
    return polarToCartesian(i * angleStep, r);
  });
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Card className={cn('px-6 py-5', className)}>
      <h3
        className="mb-4 text-[14px] font-semibold text-foreground"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Skill Radar
      </h3>

      <div className="flex justify-center">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-[240px]">
          {ringPaths.map((points, i) => (
            <polygon
              key={`ring-${i}`}
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border"
            />
          ))}

          {skills.map((_, i) => {
            const end = polarToCartesian(i * angleStep, RADIUS);
            return (
              <line
                key={`axis-${i}`}
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            );
          })}

          <polygon
            points={dataPath}
            fill="#008c4c"
            fillOpacity="0.15"
            stroke="#008c4c"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {dataPoints.map((p, i) => (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#008c4c"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}

          {skills.map((skill, i) => {
            const labelR = RADIUS + 18;
            const pos = polarToCartesian(i * angleStep, labelR);
            return (
              <text
                key={`label-${i}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground text-[9px]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {skill.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {skills.map((skill) => (
          <div key={skill.label} className="text-center">
            <p
              className="text-[14px] font-bold text-foreground"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {skill.value}%
            </p>
            <p
              className="text-[10px] text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {skill.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
