import React, { Fragment, useRef, useState } from 'react';

// Component imports
import {
  StarOffIcon,
} from "../../../../components/Icons";
import CustomPopover from "../../../../components/CustomPopover";
import { PluginChild } from "../../MapLibre/Plugin";
import { domain } from "../../../../utils/main";
import { DjangoRequests } from "../../../../Requests";

import './style.scss';
import { Button } from '@mui/material';
import { ProjectCheckpoint } from "../../../../components/ProjectCheckpoint";

// Storymap component
export default function StoryMapSelector({ map }) {

  const projectCheckpointRef = useRef(null);
  const [projectCheckpointEnable, setProjectCheckpointEnable] = useState(false)

  const storyMaps = [
    {
      name: "Story 1",
    },
    {
      name: "Story 2",
    },
    {
      name: "Story 3",
    },
  ]

  const onSelect = async () => {
    console.log('onSelect');
    const _data = projectCheckpointRef.current.getData();
    const data = {
      layer_tab: false,
      filter_tab: false,
      map: true,
      widget_tab: false,
    }
    try {
      const response = await DjangoRequests.post(
        urls.embedDetail,
        { ...data, ..._data }
      )
      const code = `${domain()}/embed/${response.data.code}`
      // GO TO THIS URL
      window.open(code, '_blank');
    } catch (err) {
      console.error("Error creating storymap embed:", err);
    }
  }

  return (
    <Fragment>
      <ProjectCheckpoint
        map={map}
        setProjectCheckpointEnable={setProjectCheckpointEnable}
        ref={projectCheckpointRef}
      />
      <CustomPopover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        Button={
          <div className='Active'>
            <PluginChild title={'Bookmark'}>
              <a>
                <StarOffIcon />
              </a>
            </PluginChild>
          </div>
        }
      >
        {/* LIST OF STORYMAPS */}
        <div className='Body'>
          <table>
            <tbody>
              {
                storyMaps.map((storymap, index) => (
                  <tr key={index}>
                    <Button onClick={() => onSelect()}>
                      {storymap.name}
                    </Button>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </CustomPopover>
    </Fragment>
  );
}
