/**
 * Form for creating a new message
 * expects a handleSubmit method for submitting the form
 * uses formik
 **/
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
import { faSyncAlt, faCopy } from "@fortawesome/free-solid-svg-icons";
import AppContext from "../context";

interface CreateNoteFormValues {
  note: string;
  deleteAfter: string;
  secret?: string;
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
  const [secret, setSecret] = React.useState("");
  const { backend } = React.useContext(AppContext);

  React.useEffect(() => {
    async function fetchRandomKey() {
      const resp = await fetch(`${backend}/random/key`);
      const key = await resp.text();
      setSecret(key);
    }

    // if initially there is no secret or user resets, grab a new key from backend
    if (secret.length === 0) {
      fetchRandomKey();
    }
  }, [setSecret, secret]);

  return (
    <Box>
      <Formik
        initialValues={{ note: "", deleteAfter: "5m" }}
        onSubmit={async (values, actions) => {
          await handleSubmit({ ...values, secret });
          actions.setSubmitting(false);
        }}
      >
        {(props: FormikProps<CreateNoteFormValues>) => (
          <Box boxShadow="sm" w="30rem" p="4" bg="gray.900" borderRadius="25px">
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
              <FormControl mb="4">
                <FormLabel htmlFor="secret">
                  Secret (generated on the server){" "}
                </FormLabel>
                <Flex align="center">
                  <Input
                    type="text"
                    placeholder="generating..."
                    value={secret}
                    readOnly
                  />

                  <Flex ml="3" fontSize={12}>
                    <Button
                      variant="outline"
                      p="2"
                      onClick={() => navigator.clipboard.writeText(secret)}
                    >
                      <FontAwesomeIcon size="sm" icon={faCopy} />
                    </Button>
                    <Button
                      p="2"
                      ml="2"
                      variant="outline"
                      onClick={() => setSecret("")}
                    >
                      <FontAwesomeIcon size="sm" icon={faSyncAlt} />
                    </Button>
                  </Flex>
                </Flex>
              </FormControl>
              <Field name="deleteAfter">
                {({ field }) => (
                  <FormControl mb="4">
                    <FormLabel htmlFor="deleteAfter"> Expires after </FormLabel>
                    <Select {...field} w="150px">
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
                  isDisabled={!props.isValid || secret.length === 0}
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
