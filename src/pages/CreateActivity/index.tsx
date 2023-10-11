import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { schema } from "./schema.ts";
import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import i18n from '../../locales/i18n.ts'
import 'dayjs/locale/pt-br'
import 'dayjs/locale/en'
import { CustomDate } from "../../core/models/CustomDate";
import dayjs from 'dayjs';
import { useTranslation } from "react-i18next";
import { ActivityForm } from "../../core/models/ActivityForm.ts"
import { useApiCreateActivity } from "../../core/hooks/useApiCreateActivity";
import { JwtService } from "../../core/auth/JwtService.ts";
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom";
import { useApiGetCourse } from "../../core/hooks/useApiGetCourse.ts";
import { CourseResponse } from "../../core/models/CourseResponse";
import axios, { AxiosError } from "axios";
import ErrorSnackBar from "../../components/ErrorSnackBar/ErrorSnackBar";

function CreateActivity() {
  const onSubmit: SubmitHandler<ActivityForm> = (data) => submitCreateActivity(data)

  const { createActivity } = useApiCreateActivity();
  const navigate = useNavigate()
  const [course, setCourse] = useState<CourseResponse[] | ProblemDetail>([]);
  const { getCourse } = useApiGetCourse()
  const { idCourse } = useParams()
  const rawAccessToken = new JwtService().getRawAccessToken() as string;
  const [errorType, setErrorType] = useState('');
  const [openError, setOpenError] = useState(false);


  const handleError = (error: AxiosError) => {
    let responseStatus: number
    let problemDetail: ProblemDetail = { title: '', detail: '', instance: '', status: 0, type: '' }
    if (error.response) {
      problemDetail = error.response.data as ProblemDetail
      responseStatus = problemDetail.status
      if (responseStatus == 400) {
        if (error.response) problemDetail = error.response.data as ProblemDetail
        if (problemDetail.detail == "deve ser uma data futura")
          setErrorType('invalidStartDate')
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



  async function submitCreateActivity(data: ActivityForm) {
    try {
      await createActivity(data.title, data.description, data.startDate.toISOString(), data.endDate.toISOString(), data.initialFile, data.solutionFile, data.testFile, data.extension, rawAccessToken, course.id)
      navigate(`/courses/${course.id}/${course.slug}/activities?success=true`)
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        handleError(error)
      } else {
        setErrorType('unexpected')
      }
    }
  }

  const { register, setValue, watch, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  })

  const [fileType, setFileType] = useState("");
  const [language, setLanguage] = React.useState('');

  useEffect(() => {
    if (language === ".java") {
      setFileType(".java")
    } else if (language === ".js") {
      setFileType(".js")
    }
  }, [fileType, language]);

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertBase64(file);
    const [_, parts] = base64.split('base64,')
    return parts
  };

  const handleChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const { t } = useTranslation();

  useEffect(() => {
    void (async () => {
      if ((idCourse !== undefined)) {
        try {
          const courseResponse = await getCourse(idCourse, rawAccessToken);
          setCourse(courseResponse)

        }
        catch (error) {
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



  const convertedDate: CustomDate = dayjs(new Date()) as unknown as CustomDate;


  return (
    <>
      <Container maxWidth="md">
        <PageHeader title={t('createactivity.title')} text={t('createactivity.text')} />
        <form onSubmit={handleSubmit(onSubmit)}>

          <Grid container spacing={1} rowSpacing={2}>
            <Grid item xs={12}>
              <TextField
                sx={{ width: "100%" }}
                {...register("title")}
                label={t('createactivity.form.title')}
                variant="outlined"
                error={!!errors.title}
                helperText={errors.title && <span>{errors.title.message}</span>}
              />

            </Grid>

            <Grid item xs={12}>
              <TextField
                sx={{ width: "100%" }}
                {...register("description")}
                label={t('createactivity.form.desc')}
                variant="outlined"
                multiline
                maxRows={5}
                error={!!errors.description}
                helperText={errors.description && <span>{errors.description.message}</span>}
              />
            </Grid>

            <Grid item xs={12} textAlign="right" display="flex" alignItems="spaceBetween">
              <Grid item xs={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language == "pt" ? "pt-br" : "en"} >
                  <Controller
                    name={"startDate"}
                    control={control}
                    defaultValue={convertedDate}
                    render={({ field: { ref, onChange, value, ...field } }) => (

                      <DatePicker
                        {...field}
                        inputRef={ref}
                        label={t('createactivity.form.startDate')}
                        disablePast value={value ?? " "}
                        onChange={onChange as never}
                        slotProps={{
                          textField: {
                            helperText: errors.startDate && <span>{errors.startDate.message}</span>
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid >
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language == "pt" ? "pt-br" : "en"} >
                  <Controller
                    name={"endDate"}
                    control={control}
                    defaultValue={undefined}
                    render={({ field: { ref, onChange, value, ...field } }) => (

                      <DatePicker
                        {...field}
                        inputRef={ref}
                        minDate={watch().startDate}
                        label={t('createactivity.form.endDate')}
                        value={value ? value : null}
                        onChange={onChange as never}
                        slotProps={{
                          textField: {
                            helperText: errors.endDate && <span>{errors.endDate.message}</span>
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="demo-simple-select-label">Language</InputLabel>
                <Select
                  {...register("extension")}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={language}
                  label={t('createactivity.form.language')}
                  onChange={handleChange}
                >
                  <MenuItem value={".java"}>Java</MenuItem>
                  <MenuItem value={".js"}>Javascript</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {language ? <>
              <Controller
                name="field"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    type="file"
                    accept={fileType}
                    {...register("initialFile")}
                    {...field}
                    onChange={async (e) => {
                      const valorTransformado = await uploadImage(e);
                      setValue("initialFile", valorTransformado);
                    }} />
                )} />
              {errors.initialFile && <span style={{ color: "red" }}>{errors.initialFile.message}</span>}
              <Controller
                name="field"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    type="file"
                    accept={fileType}
                    {...register("testFile")}
                    {...field}
                    onChange={async (e) => {
                      const valorTransformado = await uploadImage(e);
                      setValue("testFile", valorTransformado);
                    }} />
                )} />
              {errors.testFile && <span style={{ color: "red" }}>{errors.testFile.message}</span>}
              <Controller
                name="field"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <input
                    type="file"
                    accept={fileType}
                    {...register("solutionFile")}
                    {...field}
                    onChange={async (e) => {
                      const valorTransformado = await uploadImage(e);
                      setValue("solutionFile", valorTransformado);
                    }} />
                )} />
              {errors.solutionFile && <span style={{ color: "red" }}>{errors.solutionFile.message}</span>}
            </> : <span></span>}

            <Grid item xs={12} textAlign="right">
              <Button variant="outlined" type="submit">{t('createactivity.form.button.publish')}</Button>
            </Grid>
          </Grid>
        </form>
      </Container>
      <ErrorSnackBar open={openError} handleClose={handleCloseError} errorType={errorType} />
    </>
  );
}

export default CreateActivity

// TO-DO: Criteria Part

// , defaultValues: {
//   criteria: [{ name: "", weight: 0 }]
// }
// const { fields, append, remove } = useFieldArray({
//   name: "criteria",
//   control,
//   rules: {
//     required: "Please append at least 1 item"
//   }
// });


{/* <Grid item xs={12}>
              <span>
                {t('createactivity.form.evaluation')}
              </span>
              {fields.map((field, index) => {
                return (
                  <section key={field.id}>
                    <label>
                      <span>{t('createactivity.form.evaluationField.name')}</span>
                      <input
                        {...register(`criteria.${index}.name`, { required: true })}
                      />
                    </label>
                    <label>
                      <span>{t('createactivity.form.evaluationField.weight')}</span>
                      <input
                        type="number"
                        {...register(`criteria.${index}.weight`, { valueAsNumber: true })}
                      />
                    </label>
                    <button type="button" onClick={() => remove(index)}>
                      {t('createactivity.form.evaluationField.delete')}
                    </button>
                  </section>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  append({
                    name: "",
                    weight: 0
                  });
                }}
              >
                {t('createactivity.form.evaluationField.add')}
              </button>
            </Grid> */}