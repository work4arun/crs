import React from 'react';
import { WIDGET_REGISTRY, WidgetConfig } from './registry';

interface DashboardRendererProps {
    layout: WidgetConfig[];
    data?: Record<string, unknown>; // Dynamic data needed by widgets
}

export function DashboardRenderer({ layout, data }: DashboardRendererProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {layout.map((widget) => {
                const def = WIDGET_REGISTRY[widget.type];
                if (!def) return <div key={widget.id} className="p-4 bg-red-50 text-red-500">Unknown Widget: {widget.type}</div>;

                const Component = def.component;
                // Merge default props with any data override
                // For now, we assume simple stat cards, but real implementation would map 'data' to props
                const props = { ...def.defaultProps };

                if (data && widget.type === 'stat-total-students') props.value = data.totalStudents as string | number;
                if (data && widget.type === 'stat-avg-crs') props.value = (data.averageCrs as number)?.toFixed(1);
                if (data && widget.type === 'stat-recent-violations') props.value = data.recentViolationsCount as string | number;
                if (data && widget.type === 'stat-top-performer') props.value = data.topStudentScore as string | number;

                return (
                    <div key={widget.id} className={`col-span-${widget.w || 1} row-span-${widget.h || 1}`}>
                        <Component {...props} />
                    </div>
                );
            })}
        </div>
    );
}
