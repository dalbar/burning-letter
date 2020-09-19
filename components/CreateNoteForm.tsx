import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  Textarea,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
} from "@chakra-ui/core";
import { Formik, Form, Field, FormikProps } from "formik";

interface CreateNoteFormValues {
  note: string;
  secret: string;
  deleteAfter: string;
}

interface CreateNoteFormProps {
  handleSubmit: (values: CreateNoteFormValues) => Promise<void>;
}

function validateNotEmptyString(value: string) {
  let error: string;
  if (value === "") error = "Note is not supposed to be empty";

  return error;
}

function CreateNoteForm({ handleSubmit }: CreateNoteFormProps): JSX.Element {
  return (
    <Box>
      <Formik
        initialValues={{ note: "", secret: "", deleteAfter: "5m" }}
        onSubmit={async (values, actions) => {
          await handleSubmit(values);
          actions.setSubmitting(false);
        }}
      >
        {(props: FormikProps<CreateNoteFormValues>) => (
          <Form>
            <Field name="note" validate={validateNotEmptyString}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.name && form.touched.name}>
                  <FormLabel htmlFor="note">Note</FormLabel>
                  <Textarea
                    {...field}
                    id="note"
                    placeholder="Start writing your burning letter here."
                  />
                  <FormErrorMessage> {form.errors.name} </FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="secret" validate={validateNotEmptyString}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.name && form.touched.name}>
                  <FormLabel htmlFor="secret"> Secret </FormLabel>
                  <Input
                    {...field}
                    placeholder="Enter your encryption secret."
                  />
                </FormControl>
              )}
            </Field>
            <Field name="deleteAfter">
              {({ field }) => (
                <FormControl>
                  <FormLabel htmlFor="deleteAfter"> Expires after </FormLabel>
                  <Select {...field}>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="3h">3 hours</option>
                    <option value="1d">1 day</option>
                    <option value="1w">1 week</option>
                  </Select>
                </FormControl>
              )}
            </Field>
            <Button
              type="submit"
              isDisabled={!props.isValid}
              isLoading={props.isSubmitting}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default CreateNoteForm;
