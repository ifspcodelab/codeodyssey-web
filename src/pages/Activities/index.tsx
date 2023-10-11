import React from "react";
import { useEffect, useState } from "react";
import i18n from "../../locales/i18n";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@mui/material";
import Typography from '@mui/material/Typography';
import axios, { AxiosError } from "axios";
import { JwtService } from "../../core/auth/JwtService.ts";
import { useApiGetActivities } from "../../core/hooks/useApiGetActivities.ts";
import { ActivityResponse } from "../../core/models/ActivityResponse"
import PageHeader from "../../components/PageHeader";
import SuccessrSnackBar from "../../components/SuccessSnackBar/index.tsx";
import Spinner from "../../components/Spinner";
import ErrorSnackBar from "../../components/ErrorSnackBar/ErrorSnackBar";

function Activities() {
  const queryParams = new URLSearchParams(location.search);
  const { idCourse } = useParams()
  const success = queryParams.get('success');
  const { t } = useTranslation();

  const rawAccessToken = new JwtService().getRawAccessToken() as string;
  const { getActivities } = useApiGetActivities()
  const [activities, setActivities] = useState<ActivityResponse[] | ProblemDetail>([]);

  const [loading, setLoading] = useState(true);
  const [openSuccess, setOpenSuccess] = useState(true);
  const [errorType, setErrorType] = useState('');
  const [openError, setOpenError] = useState(false);

  const handleCloseSuccess = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' || event === undefined) {
      return;
    }
    setOpenSuccess(false);
  };

  const handleError = (error: AxiosError) => {
    let responseStatus: number
    let problemDetail: ProblemDetail = { title: '', detail: '', instance: '', status: 0, type: '' }
    if (error.response) {
      problemDetail = error.response.data as ProblemDetail
      responseStatus = problemDetail.status
      if (responseStatus == 400) {
        setErrorType('badRequest')
        setOpenError(true);
      }
    } else if (error.message == "Network Error") {
      setErrorType('networkError')
      setOpenError(true);
    }
  }

  const handleCloseError = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' || event === undefined) {
      return;
    }
    setOpenError(false);
  };

  useEffect(() => {
    void (async () => {
      if (idCourse !== undefined) {
        try {
          const activitiesResponse = await getActivities(idCourse, rawAccessToken);
          setActivities(activitiesResponse)
          setLoading(false)
        } catch (error) {
          if (axios.isAxiosError(error)) {
            handleError(error)
          } else {
            setErrorType('unexpected')
          }
        }
      }
    })();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {success && <SuccessrSnackBar message={t('createactivity.successMessage')} open={openSuccess} handleClose={handleCloseSuccess} />}

      <PageHeader title={t('activities.title')} text={t('activities.text')} />

      {Array.isArray(activities) && activities.length ? activities.map((activity: ActivityResponse) => (
        <Card key={activity.id}>
          <CardContent className="cardContent">
            <Typography variant="h6" component="div" className="title">
              <Link to={activity.id}>{activity.title}</Link>
            </Typography>
            <Typography sx={{ fontSize: 14 }} gutterBottom>
              {t("activity.language")}: {activity.extension === '.java' && 'Java'}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              {new Date(activity.startDate).toLocaleDateString(i18n.language, { timeZone: "Europe/London" })} {t("courses.until")} {new Date(activity.endDate).toLocaleDateString(i18n.language, { timeZone: "Europe/London" })}
            </Typography>
          </CardContent>
        </Card>
      )) : loading ? (
        <Spinner size={150} />
      ) : (
        <Typography>{t("activities.emptyList")}</Typography>
      )}

      <ErrorSnackBar open={openError} handleClose={handleCloseError} errorType={errorType} />
    </>
  );
}

export default Activities