import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  Textarea,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/core";
import { Formik, Form, Field, FormikProps } from "formik";

interface CreateNoteFormValues {
  note: string;
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
        initialValues={{ note: "" }}
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
            <Button type="submit" isLoading={props.isSubmitting}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default CreateNoteForm;
