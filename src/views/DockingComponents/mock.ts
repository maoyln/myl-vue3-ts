export const mockData = {
    containers: {
        left: {
            id: 'container_left',
            position: 'left',
            groups: [
                {
                    id: 'group_left_01',
                    direction: 'row',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_left_01', name: '面板-left11' },
                        { id: 'panel_left_02', name: '面板-left12' },
                        { id: 'panel_left_03', name: '面板-left13' },
                    ],
                },
                {
                    id: 'group_left_02',
                    direction: 'row',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_left_02', name: '面板-left21' },
                        { id: 'panel_left_03', name: '面板-left22' },
                    ],
                },
                {
                    id: 'group_left_03',
                    direction: 'row',
                    panels: [
                        { id: 'panel_left_03', name: '面板-left31' },
                        { id: 'panel_left_04', name: '面板-left32' },
                        { id: 'panel_left_05', name: '面板-left33' },
                        { id: 'panel_left_06', name: '面板-left34' },
                    ],
                },
            ],
        },
        right: {
            id: 'container_right',
            position: 'right',
            groups: [
                {
                    id: 'group_right_01',
                    direction: 'row',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_right_01', name: '面板-right11' },
                        { id: 'panel_right_02', name: '面板-right12' },
                    ],
                },
                {
                    id: 'group_right_02',
                    direction: 'row',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_right_02', name: '面板-right21' },
                        { id: 'panel_right_03', name: '面板-right22' },
                        { id: 'panel_right_04', name: '面板-right23' },
                        { id: 'panel_right_05', name: '面板-right24' },
                        { id: 'panel_right_06', name: '面板-right25' },
                    ],
                },
            ],
        },
        top: {
            id: 'container_top',
            position: 'top',
            groups: [
                {
                    id: 'group_top_01',
                    direction: 'column',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_top_01', name: '面板-top11' },
                        { id: 'panel_top_02', name: '面板-top12' },
                        { id: 'panel_top_03', name: '面板-top13' },
                    ],
                },
                {
                    id: 'group_top_02',
                    direction: 'column',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_top_02', name: '面板-top21' },
                        { id: 'panel_top_03', name: '面板-top22' },
                        { id: 'panel_top_04', name: '面板-top23' },
                        { id: 'panel_top_05', name: '面板-top24' },
                        { id: 'panel_top_06', name: '面板-top25' },
                    ],
                },
            ],
        },
        bottom: {
            id: 'container_bottom',
            position: 'bottom',
            groups: [
                {
                    id: 'group_bottom_01',
                    direction: 'column',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_bottom_01', name: '面板-bot11' },
                        { id: 'panel_bottom_02', name: '面板-bot12' },
                    ],
                },
                {
                    id: 'group_bottom_02',
                    direction: 'column',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_bottom_02', name: '面板-bot21' },
                        { id: 'panel_bottom_03', name: '面板-bot22' },
                        { id: 'panel_bottom_04', name: '面板-bot23' },
                        { id: 'panel_bottom_05', name: '面板-bot24' },
                    ],
                },
            ],
        },
    },
        

    floatPanelGroups: [
        {
            id: 'float_panel_group_01',
            position: 'float',
            x: 100,
            y: 100,
            groups: [
                {
                    id: 'group_float_01',
                    direction: 'row',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_float_01', name: '面板-float11' },
                    ],
                },
            ],
        },
        {
            id: 'float_panel_group_02',
            position: 'float',
            x: 100,
            y: 100,
            groups: [
                {
                    id: 'group_float_02',
                    direction: 'row',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_float_01', name: '面板-float21' },
                        { id: 'panel_float_02', name: '面板-float22' },
                    ],
                },
            ],
        },
    ],

}