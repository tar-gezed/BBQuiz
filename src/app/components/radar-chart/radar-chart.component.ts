import { Component, Input, computed, OnInit, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RadarData {
    [category: string]: { correct: number, total: number };
}

interface Point {
    x: number;
    y: number;
}

@Component({
    selector: 'app-radar-chart',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="radar-container">
      @if (categories().length > 0) {
        <svg viewBox="-120 -120 240 240" class="radar-svg">
          <!-- Background webs (Concentric polygons) -->
          @for (level of [0.2, 0.4, 0.6, 0.8, 1]; track level) {
            <polygon 
              [attr.points]="getWebPoints(level)" 
              class="web-line" 
            />
          }

          <!-- Axes from center to outside -->
          @for (axis of axes(); track axis.label) {
            <line 
              x1="0" y1="0" 
              [attr.x2]="axis.x" [attr.y2]="axis.y" 
              class="axis-line" 
            />
          }

          <!-- The Data Area Polygon -->
          <polygon 
            [attr.points]="dataPointsStr()" 
            class="data-area" 
          />

          <!-- Data Points (dots on the polygon) -->
          @for (pt of dataPoints(); track $index) {
            <circle 
              [attr.cx]="pt.x" 
              [attr.cy]="pt.y" 
              r="4" 
              class="data-point" 
            />
          }

          <!-- Labels around the chart -->
          @for (axis of axes(); track axis.label; let i = $index) {
            <g class="label-group" [attr.transform]="getLabelTransform(axis)">
              <!-- Icon logic based on category (using simple emojis or SVG icons) -->
              <text text-anchor="middle" dominant-baseline="central" class="axis-icon">
                {{ getCategoryIcon(axis.label) }}
              </text>
            </g>
          }
        </svg>

        <!-- Legend (Matching your screenshot) -->
        <div class="legend">
          <h3>Légende</h3>
          <ul>
            @for (cat of categories(); track cat) {
              <li>
                <span class="legend-icon">{{ getCategoryIcon(cat) }}</span>
                <span class="legend-text">{{ cat }} ({{ getCategoryPercentage(cat) }}%)</span>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
    styleUrl: './radar-chart.component.css'
})
export class RadarChartComponent implements OnChanges {
    @Input() data: RadarData = {};

    categories = signal<string[]>([]);
    maxRadius = 80; // Scaled to fit in the -120 to +120 viewBox easily

    ngOnChanges() {
        this.categories.set(Object.keys(this.data));
    }

    // Calculate points for the background web
    getWebPoints(level: number): string {
        const cats = this.categories();
        if (cats.length === 0) return '';

        return cats.map((_, i) => {
            const angle = (Math.PI * 2 * i) / cats.length - Math.PI / 2; // -PI/2 starts at the top
            const x = Math.cos(angle) * this.maxRadius * level;
            const y = Math.sin(angle) * this.maxRadius * level;
            return `${x},${y}`;
        }).join(' ');
    }

    axes = computed(() => {
        const cats = this.categories();
        return cats.map((label, i) => {
            const angle = (Math.PI * 2 * i) / cats.length - Math.PI / 2;
            return {
                label,
                angle,
                x: Math.cos(angle) * this.maxRadius,
                y: Math.sin(angle) * this.maxRadius
            };
        });
    });

    dataPoints = computed(() => {
        const axesData = this.axes();
        return axesData.map(axis => {
            const stat = this.data[axis.label];
            const percentage = stat && stat.total > 0 ? stat.correct / stat.total : 0;

            const r = this.maxRadius * percentage;
            return {
                x: Math.cos(axis.angle) * r,
                y: Math.sin(axis.angle) * r
            };
        });
    });

    dataPointsStr = computed(() => {
        return this.dataPoints().map(p => `${p.x},${p.y}`).join(' ');
    });

    getLabelTransform(axis: { angle: number, x: number, y: number }): string {
        // Push labels a bit further out than the maxRadius
        const labelRadius = this.maxRadius + 22;
        const x = Math.cos(axis.angle) * labelRadius;
        const y = Math.sin(axis.angle) * labelRadius;
        return `translate(${x}, ${y})`;
    }

    getCategoryPercentage(cat: string): number {
        const stat = this.data[cat];
        if (!stat || stat.total === 0) return 0;
        return Math.round((stat.correct / stat.total) * 100);
    }

    // Very simple icon mapping for categories based on French Nationality Test
    getCategoryIcon(cat: string): string {
        const lower = cat.toLowerCase();
        if (lower.includes('histoire') || lower.includes('géographie') || lower.includes('culture')) return '🌍';
        if (lower.includes('droit') || lower.includes('devoir')) return '⚖️';
        if (lower.includes('principe') || lower.includes('valeur')) return '🤝'; // Using handshake to resemble the screenshot
        if (lower.includes('institutionnel') || lower.includes('politique')) return '🏛️';
        if (lower.includes('société')) return '👥';
        return '📌';
    }
}
