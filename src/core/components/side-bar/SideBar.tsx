import { Avatar, Box, Divider, Drawer, Icon, List, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme } from "@mui/material"
import { useDrawerContext } from "../../contexts/DrawerContext"
import { useMatch, useNavigate, useResolvedPath } from "react-router-dom";
import { useEffect, useState } from "react";
import { JwtService } from '../../auth/JwtService';
import { AccessToken } from '../../models/AccessToken';
import { useTranslation } from 'react-i18next';
interface ISideBar {
  children: React.ReactNode
}

interface IListItemLinkProps {
  to: string;
  label: string;
  icon: string;
  onClick: (() => void) | undefined;
}

const ListItemLink: React.FC<IListItemLinkProps> = ({ to, icon, label, onClick }) => {
  const navigate = useNavigate()

  const resolvedPath = useResolvedPath(to)
  const match = useMatch({ path: resolvedPath.pathname, end: false })
  const { t } = useTranslation();

  const handleClick = () => {
    navigate(to)
    onClick?.()
    if (label === t("sidebar.logout")) {
      handleLogout()
    }
  }
  const [, setToken] = useState<AccessToken | null>(null);

  useEffect(() => {
    const jwtService = new JwtService();
    setToken(jwtService.getAccessToken());
  }, []);

  const handleLogout = () => {
    const jwtService = new JwtService();
    jwtService.removeTokens();
    setToken(null);
    navigate("/");
    window.location.reload();
  }

  return (
    <ListItemButton selected={!!match} onClick={handleClick}>
      <ListItemIcon>
        <Icon>{icon}</Icon>
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  )
}

export const SideBar: React.FC<ISideBar> = ({ children }) => {

  const theme = useTheme()
  const smDown = useMediaQuery(theme.breakpoints.down('sm'))

  const { isDrawerOpen, toggleDrawerOpen, drawerOptions } = useDrawerContext()


  return (
    <>
      <Drawer open={isDrawerOpen} variant={smDown ? 'temporary' : 'permanent'} onClose={toggleDrawerOpen}>
        <Box width={theme.spacing(28)} height="100%" display="flex" flexDirection="column" >

          <Box width="100%" height={theme.spacing(20)} display="flex" alignItems="center" justifyContent="center">
            <Avatar
              sx={{ height: theme.spacing(12), width: theme.spacing(12) }}
            />
          </Box>

          <Divider />

          <Box flex={1}>
            <List component="nav">
              {drawerOptions.map(drawerOption => (
                <ListItemLink
                  key={drawerOption.label}
                  to={drawerOption.path}
                  icon={drawerOption.icon}
                  label={drawerOption.label}
                  onClick={smDown ? toggleDrawerOpen : undefined}
                />
              ))}
            </List>
          </Box>

        </Box>
      </Drawer>

      <Box height="100vh" marginLeft={smDown ? 0 : theme.spacing(28)}>
        {children}
      </Box>
    </>

  )
}