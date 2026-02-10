import { StatCard } from "../stat-card";
import { Users, TrendingUp, AlertOctagon, Award } from "lucide-react";

interface WidgetDefinition {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.ComponentType<any>;
    defaultProps: Record<string, unknown>;
    label: string;
}

// Widget Registry maps widget 'type' to a Component and default props
export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
    'stat-total-students': {
        component: StatCard,
        defaultProps: { title: 'Total Students', value: 'Loading...', icon: Users, colorClass: 'bg-blue-600' },
        label: 'Stat: Total Students'
    },
    'stat-avg-crs': {
        component: StatCard,
        defaultProps: { title: 'Avg CRS', value: 'Loading...', icon: TrendingUp, colorClass: 'bg-green-600' },
        label: 'Stat: Average CRS'
    },
    'stat-recent-violations': {
        component: StatCard,
        defaultProps: { title: 'Violations (7d)', value: 'Loading...', icon: AlertOctagon, colorClass: 'bg-red-600' },
        label: 'Stat: Recent Violations'
    },
    'stat-top-performer': {
        component: StatCard,
        defaultProps: { title: 'Top Performer', value: 'Loading...', icon: Award, colorClass: 'bg-purple-600' },
        label: 'Stat: Top Performer'
    }
    // Future: Add Tables/Charts as widgets
};

export interface WidgetConfig {
    id: string;
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
}
