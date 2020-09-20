import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  Flex,
  Text,
  Textarea,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
} from "@chakra-ui/core";
import { Formik, Form, Field, FormikProps } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

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
  const [hiddenSecret, setHiddenSecret] = React.useState(true);
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
          <Box w="30rem" p="4" bg="gray.900" borderRadius="25px">
            <Text mb="5" fontSize="lg" color="gray.600">
              Create a new note
            </Text>
            <Form>
              <Field name="note" validate={validateNotEmptyString}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.name && form.touched.name}
                    mb="4"
                  >
                    <FormLabel htmlFor="note">Note</FormLabel>
                    <Textarea
                      {...field}
                      id="note"
                      placeholder="Start writing your burning letter here."
                      h="400px"
                      resize="vertical"
                    />
                    <FormErrorMessage> {form.errors.name} </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="secret" validate={validateNotEmptyString}>
                {({ field, form }) => (
                  <FormControl
                    mb="4"
                    isInvalid={form.errors.name && form.touched.name}
                  >
                    <FormLabel htmlFor="secret"> Secret </FormLabel>

                    <Flex align="center">
                      <Input
                        type={hiddenSecret ? "password" : "text"}
                        {...field}
                        placeholder="Enter your encryption secret."
                      />

                      <Flex ml="3" fontSize={12}>
                        <Button
                          variant="outline"
                          p="2"
                          onClick={() => setHiddenSecret(!hiddenSecret)}
                        >
                          <FontAwesomeIcon
                            size="sm"
                            icon={hiddenSecret ? faEyeSlash : faEye}
                          />
                        </Button>
                        <Button p="2" ml="2" variant="outline">
                          <FontAwesomeIcon size="sm" icon={faSyncAlt} />
                        </Button>
                      </Flex>
                    </Flex>
                  </FormControl>
                )}
              </Field>
              <Field name="deleteAfter">
                {({ field }) => (
                  <FormControl mb="4">
                    <FormLabel htmlFor="deleteAfter"> Expires after </FormLabel>
                    <Select {...field} w="150px">
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
              <Flex justify="end">
                <Button
                  type="submit"
                  isDisabled={!props.isValid}
                  isLoading={props.isSubmitting}
                  mt="4"
                >
                  Submit
                </Button>
              </Flex>
            </Form>
          </Box>
        )}
      </Formik>
    </Box>
  );
}

export default CreateNoteForm;
