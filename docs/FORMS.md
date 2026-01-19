# Form Usage

## Setup

```tsx
import { useAppForm } from '@/hooks/demo.form'
import { z } from 'zod'
```

## Define Form

```tsx
const form = useAppForm({
  defaultValues: {
    title: '',
    description: '',
  },
  validators: {
    onBlur: schema,
  },
  onSubmit: ({ value }) => {
    console.log(value)
  },
})
```

## Validation Options

### Zod Schema

```ts
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

validators: {
  onBlur: schema,
}
```

### Inline Validators

```ts
validators: {
  onBlur: ({ value }) => {
    const errors = { fields: {} } as { fields: Record<string, string> }
    if (value.fullName.trim().length === 0) {
      errors.fields.fullName = 'Full name is required'
    }
    return errors
  },
}
```

## Form Fields

```tsx
<form
  onSubmit={(e) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }}
>
  <form.AppField name="title">
    {(field) => <field.TextField label="Title" />}
  </form.AppField>

  <form.AppField name="description">
    {(field) => <field.TextArea label="Description" />}
  </form.AppField>

  <form.AppField name="country">
    {(field) => (
      <field.Select
        label="Country"
        values={[
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
        ]}
        placeholder="Select a country"
      />
    )}
  </form.AppField>

  <form.AppForm>
    <form.SubscribeButton label="Submit" />
  </form.AppForm>
</form>
```

## Nested Objects

```tsx
defaultValues: {
  address: {
    street: '',
    city: '',
    state: '',
  },
}

<form.AppField name="address.street">
  {(field) => <field.TextField label="Street Address" />}
</form.AppField>

<form.AppField name="address.city">
  {(field) => <field.TextField label="City" />}
</form.AppField>
```

## Field-Level Validation

```tsx
<form.AppField
  name="email"
  validators={{
    onBlur: ({ value }) => {
      if (!value || value.trim().length === 0) {
        return 'Email is required'
      }
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return 'Invalid email address'
      }
      return undefined
    },
  }}
>
  {(field) => <field.TextField label="Email" />}
</form.AppField>
```

## Key Points

- Use `useAppForm` hook from `@/hooks/demo.form`
- Wrap fields in `form.AppField`
- Prevent default on form submit, call `form.handleSubmit()`
- Validate on blur using Zod schema or inline functions
- Support nested objects with dot notation (`address.street`)
- Use `TextField`, `TextArea`, `Select` field components
