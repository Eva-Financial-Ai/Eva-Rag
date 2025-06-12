import React from 'react';
import Button from './common/Button/Button';
import ButtonGroup from './common/Button/ButtonGroup';
import FormSection from './common/Form/FormSection';

const ButtonExample: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Button System</h1>
      
      <FormSection title="Solid Buttons">
        <p className="mb-4">
          Solid buttons use appropriate text colors based on their background color for optimal contrast.
          Light background buttons use dark text, dark background buttons use light text.
        </p>
        
        <h3 className="text-xl font-semibold mb-3">Primary Variants</h3>
        <ButtonGroup spacing="md" className="mb-6">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="info">Info</Button>
          <Button variant="light">Light</Button>
          <Button variant="dark">Dark</Button>
        </ButtonGroup>
        
        <h3 className="text-xl font-semibold mb-3">Button Sizes</h3>
        <ButtonGroup spacing="md" className="mb-6">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </ButtonGroup>
      </FormSection>
      
      <FormSection title="Outline Buttons">
        <p className="mb-4">
          Outline buttons invert their colors on hover, switching from colored text on transparent background
          to white/black text on colored background for optimal contrast.
        </p>
        
        <ButtonGroup spacing="md" className="mb-6">
          <Button variant="outline-primary">Outline Primary</Button>
          <Button variant="outline-secondary">Outline Secondary</Button>
          <Button variant="outline-success">Outline Success</Button>
          <Button variant="outline-danger">Outline Danger</Button>
          <Button variant="outline-warning">Outline Warning</Button>
          <Button variant="outline-info">Outline Info</Button>
          <Button variant="outline-light">Outline Light</Button>
          <Button variant="outline-dark">Outline Dark</Button>
        </ButtonGroup>
      </FormSection>
      
      <FormSection title="Special States">
        <h3 className="text-xl font-semibold mb-3">Disabled Buttons</h3>
        <ButtonGroup spacing="md" className="mb-6">
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="outline-primary" disabled>Disabled Outline</Button>
        </ButtonGroup>
        
        <h3 className="text-xl font-semibold mb-3">Loading Buttons</h3>
        <ButtonGroup spacing="md" className="mb-6">
          <Button variant="primary" isLoading>Loading</Button>
          <Button variant="success" isLoading>Processing</Button>
        </ButtonGroup>
        
        <h3 className="text-xl font-semibold mb-3">Full Width</h3>
        <div className="space-y-3 mb-6">
          <Button variant="primary" fullWidth>Full Width Button</Button>
          <Button variant="outline-primary" fullWidth>Full Width Outline</Button>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Link Button</h3>
        <ButtonGroup spacing="md">
          <Button variant="link">Link Button</Button>
        </ButtonGroup>
      </FormSection>
      
      <FormSection title="Button Groups">
        <h3 className="text-xl font-semibold mb-3">Horizontal Group</h3>
        <ButtonGroup spacing="sm" alignment="center" className="mb-6">
          <Button variant="primary">First</Button>
          <Button variant="primary">Second</Button>
          <Button variant="primary">Third</Button>
        </ButtonGroup>
        
        <h3 className="text-xl font-semibold mb-3">Vertical Group</h3>
        <ButtonGroup orientation="vertical" spacing="sm" className="mb-6">
          <Button variant="outline-primary">First</Button>
          <Button variant="outline-primary">Second</Button>
          <Button variant="outline-primary">Third</Button>
        </ButtonGroup>
        
        <h3 className="text-xl font-semibold mb-3">Justified Group</h3>
        <ButtonGroup spacing="none" alignment="between" className="mb-6">
          <Button variant="secondary">Left</Button>
          <Button variant="secondary">Center</Button>
          <Button variant="secondary">Right</Button>
        </ButtonGroup>
      </FormSection>
    </div>
  );
};

export default ButtonExample; 