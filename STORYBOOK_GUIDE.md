# Storybook & Local Development Integration Guide

This guide details how to run the complete local development environment (Next.js, NestJS, and Storybook) and how to design, redesign, and document reusable UI components using Storybook.

---

## 🚀 Part 1: Running the Complete Project Locally

To run the entire health bridge stack, you need to boot three separate processes. Follow these steps:

### 1. Credentials Setup
Copy the environment files and input your credentials (if using live ABDM gateways, otherwise it defaults to simulated offline mode):
* **Root Folder (Next.js Frontend)**:
  ```bash
  cp .env.example .env
  ```
* **Backend Folder (NestJS Backend)**:
  ```bash
  cp backend/.env.example backend/.env
  ```

### 2. Startup Commands

Open three terminal windows or tabs to run the services concurrently:

| Service | Directory | Command | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **NestJS Backend** | `./backend` | `npm run start:dev` | `3001` | Runs persistent DB layer, cryptographic Diffie-Hellman handshakes, and ABDM proxy routing. |
| **Next.js Frontend** | `.` | `npm run dev` | `3000` | Boots App Router dashboards and telemetry consoles (with rewrites to `3001` for `/api/abdm/*` calls). |
| **Storybook Sandbox** | `.` | `npm run storybook` | `6006` | Launches the isolated UI component workshop browser dashboard. |

---

## 🎨 Part 2: Reusable UI Components Catalog

We have designed and integrated several core reusable components that adapt dynamically to dark, light, and sandbox themes:

### 1. Badge Component (`src/components/common/Badge.tsx`)
A status tag that represents active sessions, verifications, and status levels (success/warning/danger/info).
* **Story**: `src/components/common/Badge.stories.tsx`
* **Features**: Combines color codes matching active stylesheets, rendering check/alert icons, and automatically maintaining readable contrasts under light and dark modes.

### 2. Button Component (`src/components/common/Button.tsx`)
A consistent action button that unifies primary operations, loading spinners, and back button behaviors across mobile and desktop.
* **Story**: `src/components/common/Button.stories.tsx`
* **Features**: Automatically embeds standard back gesture layout styling and icons, resolves responsiveness on mobile and tablet screens, and locks double clicks during loading states.

### 3. Toast Component (`src/components/common/Toast.tsx`)
An interactive component wrapping the app's DOM-based toast notification service (`showToast`).
* **Story**: `src/components/common/Toast.stories.tsx`
* **Features**: Displays static mockups for success/error alerts in Storybook, and provides interactive trigger controls to test live slide-out toast animations on the fly.

---

## ✍️ Part 3: Adding New Items to Storybook

Storybook uses **Component Story Format (CSF 3.0)** to define stories as ES modules.

### 1. Where to Place Story Files
Always place your story file adjacent to the component it documents:
```
src/
  components/
    common/
      MyComponent.tsx
      MyComponent.stories.tsx   <-- Store stories here
```

### 2. Story Structure Template
Here is a template you can copy to write a story for a TypeScript component. This imports `Meta` and `StoryObj` and sets up control parameters:

```tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MyComponent from './MyComponent';

// 1. Meta definition
const meta: Meta<typeof MyComponent> = {
  title: 'Common/MyComponent', // Sidebar category / display name
  component: MyComponent,
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

// 2. Default Story Scenario
export const Default: Story = {
  args: {
    label: 'Click Me',
    variant: 'primary',
    disabled: false,
  },
};

// 3. Alternate Story Scenario
export const DisabledState: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
```

---

## 🧩 Part 4: Redesigning and Managing UI Consistency in Storybook

To redesign your interface systematically using Storybook, follow the **Component-Driven Development (CDD)** workflow:

### 1. Context Decorators (Pre-configured)
Stories in this project are automatically wrapped with global context decorators in [.storybook/preview.tsx](file:///d:/projects/abhasetu-mama/.storybook/preview.tsx). This means your stories can render components that access:
* **Redux States** (`StoreProvider` via Redux Toolkit)
* **API Caches** (`QueryProvider` via TanStack Query)
* **Translations** (`LanguageProvider` via `useLanguage`)
* **Theme Tokens** (`ThemeProvider` via Light/Dark/ABDM stylesheets)

### 2. Redesigning for Themes (Light vs Dark vs ABDM Sandbox)
Because the `ThemeProvider` is injected as a decorator, your components will adapt to theme colors. To test how a component looks in different themes, you can configure Storybook states:
* Use the class selectors defined in [globals.css](file:///d:/projects/abhasetu-mama/src/styles/globals.css) (e.g. `theme-light`, `theme-abdm-sandbox`, `theme-ocean-blue`).
* Toggle theme classes on the preview canvas body to check high-contrast legibility instantly.

### 3. Redesigning Controlled Components
If a component relies on active state modifications (like inputs, checkboxes, or dropdown selectors), write an interactive wrapper in your story to manage that state:

```tsx
import React, { useState } from 'react';

const InteractiveWrapper = (props: any) => {
  const [isChecked, setIsChecked] = useState(props.checked || false);
  return <MyCheckbox {...props} checked={isChecked} onChange={setIsChecked} />;
};

export const Interactive: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    checked: false,
  },
};
```

---

## 🛠️ Verification Commands
* **Type-Safety Check**:
  ```bash
  npx tsc --noEmit
  ```
* **Build Storybook for Deployment/Staging**:
  ```bash
  This exports static assets to `./storybook-static/` which can be served using static hosts.

---

## 🔍 Troubleshooting

### Next.js Compilation Caching Issues
If you recently added or removed major dependencies (like Sentry or telemetry packages) and experience module resolution errors (e.g. `ENOENT: no such file or directory` looking for packages like `@opentelemetry/api` or `@sentry/*`), Next.js is likely loading older compiled chunks from its internal build cache.

To resolve this, clean the build cache and restart the dev server:
```bash
# Delete the local Next.js cache directory
rm -rf .next

# Start the dev server fresh
npm run dev
```

