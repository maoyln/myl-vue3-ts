export const mockData = {
    containers: {
        left: {
            id: 'container_left',
            position: 'left',
            width: 200,
            height: 200,
            groups: [
                {
                    id: 'group_left_01',
                    direction: 'row',
                    panels: [
                        { id: 'panel_left_01', name: '面板1' },
                        { id: 'panel_left_02', name: '面板2' },
                        { id: 'panel_left_03', name: '面板3' },
                    ],
                },
                {
                    id: 'group_left_02',
                    direction: 'row',
                    panels: [
                        { id: 'panel_left_02', name: '面板2' },
                        { id: 'panel_left_03', name: '面板3' },
                    ],
                },
                {
                    id: 'group_left_03',
                    direction: 'row',
                    panels: [
                        { id: 'panel_left_03', name: '面板3' },
                        { id: 'panel_left_04', name: '面板4' },
                        { id: 'panel_left_05', name: '面板5' },
                        { id: 'panel_left_06', name: '面板6' },
                    ],
                },
            ],
        },
        right: {
            id: 'container_right',
            position: 'right',
            width: 200,
            height: 200,
            groups: [
                {
                    id: 'group_right_01',
                    direction: 'row',
                    panels: [
                        { id: 'panel_right_01', name: '面板1' },
                        { id: 'panel_right_02', name: '面板2' },
                    ],
                },
                {
                    id: 'group_right_02',
                    direction: 'row',
                    panels: [
                        { id: 'panel_right_02', name: '面板2' },
                        { id: 'panel_right_03', name: '面板3' },
                        { id: 'panel_right_04', name: '面板4' },
                        { id: 'panel_right_05', name: '面板5' },
                        { id: 'panel_right_06', name: '面板6' },
                    ],
                },
            ],
        },
        top: {
            id: 'container_top',
            position: 'top',
            width: 200,
            height: 200,
            groups: [
                {
                    id: 'group_top_01',
                    direction: 'column',
                    panels: [
                        { id: 'panel_top_01', name: '面板1' },
                        { id: 'panel_top_02', name: '面板2' },
                        { id: 'panel_top_03', name: '面板3' },
                    ],
                },
                {
                    id: 'group_top_02',
                    direction: 'column',
                    panels: [
                        { id: 'panel_top_02', name: '面板2' },
                        { id: 'panel_top_03', name: '面板3' },
                        { id: 'panel_top_04', name: '面板4' },
                        { id: 'panel_top_05', name: '面板5' },
                        { id: 'panel_top_06', name: '面板6' },
                    ],
                },
            ],
        },
        bottom: {
            id: 'container_bottom',
            position: 'bottom',
            width: 200,
            height: 200,
            groups: [
                {
                    id: 'group_bottom_01',
                    direction: 'column',
                    panels: [
                        { id: 'panel_bottom_01', name: '面板1' },
                        { id: 'panel_bottom_02', name: '面板2' },
                    ],
                },
                {
                    id: 'group_bottom_02',
                    direction: 'column',
                    panels: [
                        { id: 'panel_bottom_02', name: '面板2' },
                        { id: 'panel_bottom_03', name: '面板3' },
                        { id: 'panel_bottom_04', name: '面板4' },
                    ],
                },
            ],
        },
    },
        

    floatPanelGroups: [
        {
            id: 'float_panel_group_01',
            position: 'float',
            width: 200,
            height: 200,
            x: 100,
            y: 100,
            groups: [
                {
                    id: 'group_float_01',
                    direction: 'row',
                    panels: [
                        { id: 'panel_float_01', name: '面板1' },
                    ],
                },
            ],
        },
        {
            id: 'float_panel_group_02',
            position: 'float',
            width: 200,
            height: 200,
            x: 100,
            y: 100,
            groups: [
                {
                    id: 'group_float_02',
                    direction: 'row',
                    panels: [
                        { id: 'panel_float_01', name: '面板1' },
                        { id: 'panel_float_02', name: '面板2' },
                    ],
                },
            ],
        },
    ],

}