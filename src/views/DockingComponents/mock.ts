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
                        { id: 'panel_left_11', name: '面板-left11' },
                        { id: 'panel_left_12', name: '面板-left12' },
                        { id: 'panel_left_13', name: '面板-left13' },
                    ],
                },
                // {
                //     id: 'group_left_02',
                //     direction: 'row',
                //     width: 200,
                //     height: 200,
                //     panels: [
                //         { id: 'panel_left_21', name: '面板-left21' },
                //         { id: 'panel_left_22', name: '面板-left22' },
                //     ],
                // },
                // {
                //     id: 'group_left_03',
                //     direction: 'row',
                //     panels: [
                //         { id: 'panel_left_31', name: '面板-left31' },
                //         { id: 'panel_left_32', name: '面板-left32' },
                //         { id: 'panel_left_33', name: '面板-left33' },
                //         { id: 'panel_left_34', name: '面板-left34' },
                //     ],
                // },
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
                        { id: 'panel_right_11', name: '面板-right11', 
                            tabs: [
                                { id: 'tab_right_01', title: '面板-right11-标签1', component: 'PanelRight01' },
                                { id: 'tab_right_02', title: '面板-right12-标签2', component: 'PanelRight02' }
                            ] 
                        },
                        { id: 'panel_right_12', name: '面板-right12' },
                    ],
                },
                {
                    id: 'group_right_02',
                    direction: 'row',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_right_21', name: '面板-right21' },
                        { id: 'panel_right_22', name: '面板-right22' },
                        { id: 'panel_right_23', name: '面板-right23' },
                        { id: 'panel_right_24', name: '面板-right24' },
                        { id: 'panel_right_25', name: '面板-right25' },
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
                        { id: 'panel_top_11', name: '面板-top11' },
                        { id: 'panel_top_12', name: '面板-top12' },
                        { id: 'panel_top_13', name: '面板-top13' },
                    ],
                },
                // {
                //     id: 'group_top_02',
                //     direction: 'column',
                //     width: 200,
                //     height: 200,
                //     panels: [
                //         { id: 'panel_top_21', name: '面板-top21' },
                //         { id: 'panel_top_22', name: '面板-top22' },
                //         { id: 'panel_top_23', name: '面板-top23' },
                //         { id: 'panel_top_24', name: '面板-top24' },
                //         { id: 'panel_top_25', name: '面板-top25' },
                //     ],
                // },
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
                        { id: 'panel_bottom_11', name: '面板-bot11' },
                        { id: 'panel_bottom_12', name: '面板-bot12' },
                    ],
                },
                
                {
                    id: 'group_bottom_02',
                    direction: 'column',
                    width: 200,
                    height: 200,
                    panels: [
                        { id: 'panel_bottom_21', name: '面板-bot21' },
                        { id: 'panel_bottom_22', name: '面板-bot22' },
                        { id: 'panel_bottom_23', name: '面板-bot23' },
                        { id: 'panel_bottom_24', name: '面板-bot24' },
                    ],
                },
            ],
        },
    },
        

    floatPanelGroups: [
        // {
        //     id: 'float_panel_group_01',
        //     position: 'float',
        //     x: 10,
        //     y: 10,
        //     groups: [
        //         {
        //             id: 'group_float_01',
        //             direction: 'column',
        //             width: 200,
        //             height: 200,
        //             panels: [
        //                 { id: 'panel_float_11', name: '浮动窗体1-面板1' },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     id: 'float_panel_group_02',
        //     position: 'float',
        //     x: 1000,
        //     y: 650,
        //     groups: [
        //         {
        //             id: 'group_float_02',
        //             direction: 'column',
        //             width: 400,
        //             height: 250,
        //             panels: [
        //                 { id: 'panel_float_21', name: '浮动窗体2-面板1' },
        //                 { id: 'panel_float_22', name: '浮动窗体2-面板2' },
        //             ],
        //         },
        //     ],
        // },
    ],

}