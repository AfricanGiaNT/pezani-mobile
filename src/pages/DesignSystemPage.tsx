import { useState } from 'react';
import { Button, Input, Card, Modal } from '@/components/common';
import { Search, Mail, Lock, Heart, Home, User } from 'lucide-react';

/**
 * Design System Showcase Page
 * This page demonstrates all reusable components with their variants
 * Use this for testing and as a reference during development
 */

const DesignSystemPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-custom">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text mb-2">Pezani Design System</h1>
          <p className="text-text-light">Component showcase and testing page</p>
        </div>

        {/* Colors Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-24 bg-primary rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-text-light">#E4B012</p>
            </div>
            <div>
              <div className="h-24 bg-secondary rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-text-light">#1E3A5F</p>
            </div>
            <div>
              <div className="h-24 bg-accent rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-text-light">#2E7D6B</p>
            </div>
            <div>
              <div className="h-24 bg-error rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs text-text-light">#DC3545</p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-medium mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width Button</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="text-lg font-medium mb-3">With Icons</h3>
              <div className="flex flex-wrap gap-3">
                <Button>
                  <Heart className="mr-2 h-4 w-4" />
                  Save Property
                </Button>
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Browse Homes
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Input Fields</h2>
          
          <div className="max-w-md space-y-6">
            {/* Basic Input */}
            <Input
              label="Property Title"
              placeholder="Enter property title"
              helperText="This will be displayed on the property card"
            />

            {/* With Icons */}
            <Input
              label="Search Properties"
              placeholder="Search by location or name"
              leftIcon={<Search size={18} />}
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              leftIcon={<Mail size={18} />}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter password"
              leftIcon={<Lock size={18} />}
            />

            {/* Error State */}
            <Input
              label="Phone Number"
              placeholder="+265 888 123 456"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value && !e.target.value.startsWith('+265')) {
                  setInputError('Phone must start with +265');
                } else {
                  setInputError('');
                }
              }}
              error={inputError}
            />

            {/* Disabled */}
            <Input
              label="Property ID"
              value="PZ-001234"
              disabled
            />
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Card */}
            <Card>
              <h3 className="text-lg font-semibold mb-2">Basic Card</h3>
              <p className="text-text-light">
                This is a basic card with default padding and styling.
              </p>
            </Card>

            {/* Card with Header */}
            <Card
              header={
                <h3 className="text-lg font-semibold">Card with Header</h3>
              }
            >
              <p className="text-text-light">
                This card has a header section separated by a border.
              </p>
            </Card>

            {/* Card with Footer */}
            <Card
              footer={
                <Button fullWidth variant="outline">
                  View Details
                </Button>
              }
            >
              <h3 className="text-lg font-semibold mb-2">Card with Footer</h3>
              <p className="text-text-light">
                This card includes a footer with an action button.
              </p>
            </Card>

            {/* Hoverable Card */}
            <Card hoverable>
              <h3 className="text-lg font-semibold mb-2">Hoverable Card</h3>
              <p className="text-text-light">
                Hover over this card to see the elevation effect.
              </p>
            </Card>

            {/* Card with Different Padding */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold mb-2">Large Padding</h3>
              <p className="text-text-light">
                This card uses larger padding for more spacious content.
              </p>
            </Card>

            {/* Property Card Preview */}
            <Card hoverable padding="none">
              <div className="relative">
                <div className="h-48 bg-gray-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500">Property Image</span>
                </div>
                <div className="absolute top-2 right-2 bg-white rounded-full p-2">
                  <Heart size={20} className="text-primary" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">3 Bed House</h3>
                  <span className="text-primary font-bold">MWK 150,000</span>
                </div>
                <p className="text-sm text-text-light mb-3">Area 47, Lilongwe</p>
                <div className="flex gap-3 text-sm text-text-light">
                  <span>🛏 3</span>
                  <span>🚿 2</span>
                  <span>🏠 House</span>
                </div>
                <div className="mt-3">
                  <span className="badge badge-success">● Available</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>
          
          <div className="flex flex-wrap gap-3">
            <span className="badge badge-success">● Available</span>
            <span className="badge badge-error">● Unavailable</span>
            <span className="badge badge-warning">Pending</span>
            <span className="badge badge-gray">Draft</span>
            <span className="badge badge-primary">Featured</span>
          </div>
        </section>

        {/* Modal Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Modal</h2>
          
          <Button onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-text-light">
                This is a modal dialog with smooth animations. You can close it by clicking the X button, 
                clicking outside, or pressing the Escape key.
              </p>
              
              <Input
                label="Your Name"
                placeholder="Enter your name"
              />

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Typography</h2>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-1">Heading 1</h1>
              <p className="text-sm text-text-light">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">Heading 2</h2>
              <p className="text-sm text-text-light">text-3xl font-bold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-1">Heading 3</h3>
              <p className="text-sm text-text-light">text-2xl font-semibold</p>
            </div>
            <div>
              <p className="text-base mb-1">Body text - Regular</p>
              <p className="text-sm text-text-light">text-base</p>
            </div>
            <div>
              <p className="text-sm text-text-light mb-1">Small text</p>
              <p className="text-sm text-text-light">text-sm text-text-light</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSystemPage;

