import React, { useState } from 'react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { Input } from '../common/Input';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Loader from '../common/Loader';

// Define props for the sandbox component
interface CommonComponentsSandboxProps {
  darkMode?: boolean;
}

/**
 * Sandbox for testing common UI components
 */
const CommonComponentsSandbox: React.FC<CommonComponentsSandboxProps> = ({ darkMode = false }) => {
  // Component state
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  // Function to render a component preview with consistent styling
  const ComponentPreview = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className={`mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="p-4 border rounded flex flex-wrap gap-4 items-start">{children}</div>
    </Card>
  );

  return (
    <div className={darkMode ? 'text-white' : 'text-gray-800'}>
      <h2 className="text-2xl font-bold mb-6">Common UI Components</h2>

      {/* Buttons */}
      <ComponentPreview title="Buttons">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="success">Success</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="info">Info</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
        <Button isLoading>Loading</Button>
      </ComponentPreview>

      {/* Form Inputs */}
      <ComponentPreview title="Form Inputs">
        <div className="w-full max-w-xs">
          <Input
            label="Text Input"
            placeholder="Enter text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        </div>

        <div className="w-full max-w-xs">
          <Input
            label="With Error"
            placeholder="Error state"
            value=""
            error="This field is required"
          />
        </div>

        <div className="w-full max-w-xs">
          <Input label="Disabled Input" placeholder="Disabled" disabled />
        </div>

        <div className="w-full max-w-xs">
          <Select
            label="Select Input"
            placeholder="Select an option"
            value={selectValue}
            onChange={value => setSelectValue(value as string)}
            options={selectOptions}
          />
        </div>

        <div className="w-full max-w-xs flex items-center">
          <Checkbox
            label="Checkbox Input"
            checked={checkboxValue}
            onChange={e => setCheckboxValue(e.target.checked)}
          />
        </div>
      </ComponentPreview>

      {/* Avatars */}
      <ComponentPreview title="Avatars">
        <Avatar size="xs" name="John Doe" />
        <Avatar size="sm" name="Jane Smith" />
        <Avatar size="md" name="Alice Johnson" />
        <Avatar size="lg" name="Bob Brown" />
        <Avatar size="xl" name="Charlie Davis" />
        <Avatar
          size="md"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
          name="Profile Image"
        />
      </ComponentPreview>

      {/* Badges */}
      <ComponentPreview title="Badges">
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
      </ComponentPreview>

      {/* Loaders */}
      <ComponentPreview title="Loaders">
        <Loader size="sm" />
        <Loader size="md" />
        <Loader size="lg" />
        <Loader size="xl" />
      </ComponentPreview>

      {/* Modal */}
      <ComponentPreview title="Modal">
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Open Modal
        </Button>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
          <div className="p-4">
            <p className="mb-4">This is an example modal dialog.</p>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Close Modal
            </Button>
          </div>
        </Modal>
      </ComponentPreview>
    </div>
  );
};

export default CommonComponentsSandbox;
