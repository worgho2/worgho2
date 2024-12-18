'use client';

import { Button } from '@/app/_components/button';
import { Field } from '@/app/_components/field';
import { ConsoleLogger } from '@/infrastructure/logger/console-logger';
import {
  CreateShortUrl,
  CreateShortUrlInput,
  createShortUrlInputSchema,
} from '@/ports/use-cases/create-short-url';
import {
  Card,
  Container,
  Flex,
  FlexProps,
  For,
  Group,
  Input,
  InputAddon,
  Link,
} from '@chakra-ui/react';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAppUrl } from '@/app/_helpers/get-app-url';
import NextLink from 'next/link';
import { toaster } from '@/app/_components/toaster';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { getPublicEnv } from '@/app/_helpers/env';
import { MockShortUrlApi } from '@/infrastructure/short-url-api/mock-short-url-api';
import { ShortUrlData } from '@/ports/short-url-api';
import { Alert } from '@/app/_components/alert';
import { LuLink } from 'react-icons/lu';

export interface CreateShortUrlFormProps extends FlexProps {}

export const CreateShortUrlForm: React.FC<CreateShortUrlFormProps> = ({ ...flexProps }) => {
  const turnstileRef = React.useRef<TurnstileInstance>();
  const formMethods = useForm<CreateShortUrlInput>({
    defaultValues: {
      originalUrl: '',
      slug: '',
    },
    resolver: zodResolver(createShortUrlInputSchema),
  });
  const [createdUrls, setCreatedUrls] = React.useState<ShortUrlData[]>([]);

  const logger = new ConsoleLogger();
  const shortUrlApi = new MockShortUrlApi();
  const createShortUrl = new CreateShortUrl(logger, shortUrlApi);

  const onSubmit: SubmitHandler<CreateShortUrlInput> = async (data, event) => {
    event?.preventDefault();

    const output = await createShortUrl.execute({
      originalUrl: data.originalUrl,
      slug: data.slug,
      captcha: data.captcha,
    });

    turnstileRef.current?.reset();

    if (output.error === 'SLUG_IS_ALREADY_TAKEN') {
      formMethods.setError('slug', {
        message: 'Slug is already taken, please choose another one.',
      });

      return;
    }

    if (output.error !== undefined) {
      toaster.create({
        title: 'Error',
        description: `An error occurred while creating the short url: "${output.error}"`,
        duration: 5000,
        type: 'error',
      });

      return;
    }

    toaster.create({
      title: 'Success',
      description: `The short url has been created successfully!`,
      duration: 5000,
      type: 'success',
    });

    setCreatedUrls((prev) => [output, ...prev]);

    formMethods.reset();
  };

  return (
    <Flex
      width={'100%'}
      {...flexProps}
    >
      <Container maxW={'8xl'}>
        <Card.Root maxW={'8xl'}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Card.Header>
              <Card.Title>Url Shortener</Card.Title>

              <Card.Description lineHeight={'taller'}>
                Welcome to the url shortener!
                <br />
                This is a simple project powered by a <b>java micronaut serverless application</b>,
                that allows the creation of short urls.
                <br />
                The urls are stored in a <b>redis database</b> and expire after 10 minutes.
                <br />
                Server side implementation:{' '}
                <Link
                  asChild
                  wordBreak={'break-word'}
                >
                  <NextLink
                    href='https://github.com/worgho2/worgho2/tree/main/packages/url-shortener'
                    target='_blank'
                    rel='noopener noreferrer'
                    // breakline
                  >
                    https://github.com/worgho2/worgho2/tree/main/packages/url-shortener
                  </NextLink>
                </Link>
                <br />
                Client side implementation:{' '}
                <Link
                  asChild
                  wordBreak={'break-word'}
                >
                  <NextLink
                    href='https://github.com/worgho2/worgho2/tree/main/packages/web/src/app/projects/url-shortener'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    https://github.com/worgho2/worgho2/tree/main/packages/web/src/app/projects/url-shortener
                  </NextLink>
                </Link>
                <br />
                Please, give a try!
              </Card.Description>
            </Card.Header>

            <Card.Body mt={6}>
              <Field
                label={'Original Url'}
                required
                invalid={formMethods.formState.errors.originalUrl !== undefined}
                errorText={formMethods.formState.errors.originalUrl?.message}
                helperText={'The original url that you want to shorten.'}
              >
                <Input
                  placeholder='https://some-tremendous-url-that-you-have...'
                  {...formMethods.register('originalUrl')}
                />
              </Field>

              <Field
                mt={6}
                label={'Slug'}
                required
                invalid={formMethods.formState.errors.slug !== undefined}
                errorText={formMethods.formState.errors.slug?.message}
                helperText={'The slug that you want to use for the short url.'}
              >
                <Group
                  attached
                  width={'100%'}
                >
                  <InputAddon
                    display={{
                      base: 'none',
                      md: 'flex',
                    }}
                  >
                    {getAppUrl('/projects/url-shortener/').href}
                  </InputAddon>
                  <Input {...formMethods.register('slug')} />
                </Group>
              </Field>

              <Field
                mt={6}
                required
                invalid={formMethods.formState.errors.captcha !== undefined}
                errorText={formMethods.formState.errors.captcha?.message}
              >
                <Turnstile
                  ref={turnstileRef}
                  siteKey={getPublicEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY')}
                  options={{
                    language: 'auto',
                    theme: 'light',
                  }}
                  onSuccess={(token) => {
                    formMethods.setValue('captcha', token);
                  }}
                  onExpire={() => {
                    formMethods.resetField('captcha');
                    turnstileRef.current?.reset();
                  }}
                  onError={() => {
                    formMethods.resetField('captcha');
                    turnstileRef.current?.reset();
                  }}
                />
              </Field>
            </Card.Body>

            <Card.Footer justifyContent='flex-end'>
              <Button
                variant='outline'
                onClick={() => {
                  formMethods.reset();
                  turnstileRef.current?.reset();
                  setCreatedUrls([]);
                }}
              >
                Reset
              </Button>

              <Button
                type='submit'
                variant='solid'
                loading={formMethods.formState.isSubmitting}
                loadingText='Creating...'
              >
                Create
              </Button>
            </Card.Footer>
          </form>
        </Card.Root>

        <For each={createdUrls}>
          {(item, index) => (
            <Alert
              key={`${item.slug}-${index}`}
              mt={6}
              status='success'
              title={
                <Link
                  asChild
                  wordBreak={'break-word'}
                >
                  <NextLink
                    href={getAppUrl(`/projects/url-shortener/${item.slug}`).href}
                    target='_blank'
                    rel='noopener noreferrer'
                    // breakline
                  >
                    {getAppUrl(`/projects/url-shortener/${item.slug}`).href}
                  </NextLink>
                </Link>
              }
              icon={<LuLink />}
            >
              <b>Original Url:</b> {item.originalUrl}
            </Alert>
          )}
        </For>
      </Container>
    </Flex>
  );
};
