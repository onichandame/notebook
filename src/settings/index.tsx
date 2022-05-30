import { Box, Tab, Tabs } from "@mui/material";
import { FC, useState } from "react";

import { CenterRow } from "../common";
import { Profile } from "./profile";
import { Security } from "./security";

const TabPanel: FC<{
  index: number | string;
  currentIndex: number | string;
}> = ({ index, children, currentIndex }) => {
  return (
    <div
      role="tabpanel"
      hidden={currentIndex !== index}
      id={`settings-panel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {index === currentIndex && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const Settings: FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const getTabProps = (index: number | string, title: string) => ({
    label: title,
    value: index,
    id: `settings-tab-${index}`,
    "aria-controls": `settings-panel-${index}`,
  });
  return (
    <Box sx={{ width: `auto` }}>
      <Box sx={{ borderBottom: 1, borderColor: `divider` }}>
        <Tabs
          value={currentTab}
          onChange={(_, newIndex) => {
            setCurrentTab(newIndex);
          }}
        >
          <Tab {...getTabProps(0, `Profile`)} />
          <Tab {...getTabProps(1, `Security`)} />
        </Tabs>
      </Box>
      <TabPanel index={0} currentIndex={currentTab}>
        <CenterRow>
          <Profile />
        </CenterRow>
      </TabPanel>
      <TabPanel index={1} currentIndex={currentTab}>
        <CenterRow>
          <Security />
        </CenterRow>
      </TabPanel>
    </Box>
  );
};
