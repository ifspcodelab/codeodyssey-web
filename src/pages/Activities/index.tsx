import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useApiGetActivities } from "../../core/hooks/useApiGetActivities.ts";
import React from "react";
import { Card, CardContent } from "@mui/material";
import Typography from '@mui/material/Typography';
import i18n from "../../locales/i18n";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ActivityResponse } from "../../core/models/ActivityResponse"
import { JwtService } from "../../core/auth/JwtService.ts";
import { useParams } from "react-router-dom";
import SuccessrSnackBar from "../../components/SuccessSnackBar/index.tsx";

function Activities() {
  const queryParams = new URLSearchParams(location.search);

  const { getActivities } = useApiGetActivities()
  const [activities, setActivities] = useState([]);

  const { idCourse } = useParams()
  const success = queryParams.get('success');
  const [openSuccess, setOpenSuccess] = useState(true);
  const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' || event === undefined) {
      return;
    }

    setOpenSuccess(false);
  };
  const rawAccessToken = new JwtService().getRawAccessToken() as string;
  const { t } = useTranslation();



  useEffect(() => {
    void (async () => {
      const activitiesResponse = await getActivities(idCourse, rawAccessToken);
      setActivities(activitiesResponse)
    })();
  }, []);

  return (

    <>
      {success && <SuccessrSnackBar message={t('createactivity.successMessage')} open={openSuccess} handleClose={handleCloseSuccess} />}
      <PageHeader title="Activities" text="Activities course" />
      {Array.isArray(activities) && activities.map((activity: ActivityResponse) => (
        <Card key={activity.id}>
          <CardContent className="cardContent">
            <Typography variant="h6" component="div" className="title">
              <Link to={activity.id}>{activity.name}</Link>
            </Typography>
            <Typography sx={{ fontSize: 14 }} gutterBottom>
              Description: {activity.description}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              {new Date(activity.startDate).toLocaleDateString(i18n.language, { timeZone: "Europe/London" })} {t("courses.until")} {new Date(activity.endDate).toLocaleDateString(i18n.language, { timeZone: "Europe/London" })}
            </Typography>
          </CardContent>

        </Card>
      ))}
    </>
  );
}

export default Activities