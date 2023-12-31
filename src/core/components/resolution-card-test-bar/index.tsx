import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { AxiosError } from "axios";

import { ResultsService } from "../../services/api/results/ResultsService";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import ErrorSnackBar from "../error-snack-bar/ErrorSnackBar";
import { IResultResponse } from "../../models/Result";
import { JwtService } from "../../auth/JwtService";

interface IComponentTestProps {
  resolutionId: string;
  activityId: string;
}

const ResolutionCardTestBar: React.FC<IComponentTestProps> = ({ resolutionId, activityId }) => {
  const { t } = useTranslation();

  const rawAccessToken = new JwtService().getRawAccessToken() as string;
  const [result, setResult] = useState<IResultResponse>()
  const { handleError, openError, errorType, handleCloseError } = useErrorHandler();

  const [successTest, setSuccessTest] = useState(0)
  const [errorTest, setErrorTest] = useState(0)
  const hasEffectRun = useRef(false);

  useEffect(() => {
    if ((resolutionId !== undefined) && (activityId !== undefined)) {
      ResultsService.getById(activityId, resolutionId, rawAccessToken)
        .then((response) => {
          setResult(response as IResultResponse)
        }).catch((error: AxiosError<ProblemDetail>) => {
          handleError(error)
        })
    }
  }, [rawAccessToken])

  useEffect(() => {
    if (!hasEffectRun.current && result && result.testCases) {
      result.testCases.forEach((testcase) => {
        if (testcase.success) {
          setSuccessTest((prevSuccessTest) => prevSuccessTest + 1);
        } else {
          setErrorTest((prevErrorTest) => prevErrorTest + 1);
        }
      });

      hasEffectRun.current = true;
    }
  }, [result])

  return (
    <>
      <Typography><strong>{t('resolution.tests')}</strong>: {successTest + errorTest} <span style={{ color: 'green' }}>{t('resolution.testPass')}: {successTest} </span><span style={{ color: 'red' }}>{t('resolution.testError')}: {errorTest}</span></Typography>

      <ErrorSnackBar open={openError} handleClose={handleCloseError} errorType={errorType} /></>

  )
}

export default ResolutionCardTestBar