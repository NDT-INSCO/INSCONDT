import React from 'react';
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { PautInspectorController } from '../src/components/academy/PautInspectorController';
import { EducationalAcademy } from '../src/components/EducationalAcademy';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.org/-Project-/#academy' });
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  localStorage: dom.window.localStorage,
  HTMLElement: dom.window.HTMLElement,
  HTMLCanvasElement: dom.window.HTMLCanvasElement,
});

// Mock HTML5 canvas getContext for jsdom
if (!dom.window.HTMLCanvasElement.prototype.getContext) {
  // @ts-expect-error jsdom canvas mock
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Array(4) }),
    putImageData: () => {},
    createImageData: () => ([]),
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    setLineDash: () => {},
  });
}

const { render, fireEvent, cleanup } = await import('@testing-library/react');
afterEach(() => {
  cleanup();
  localStorage.clear();
});

test('PautInspectorController renders with all primary instrument controls in English', () => {
  const ui = render(<PautInspectorController language="en" />);

  // Title and subtitle
  assert.ok(ui.getAllByText(/PAUT INSPECTOR CONTROLLER/i).length > 0);
  assert.ok(ui.getByText(/Interactive PAUT Inspector Controller & Focal Law Engine/i));

  // Beam Angle slider (0 to 90 degrees)
  const angleSlider = ui.getByLabelText(/Beam Angle/i) as HTMLInputElement;
  assert.ok(angleSlider);
  assert.equal(angleSlider.min, '0');
  assert.equal(angleSlider.max, '90');

  // Focal depth slider
  const depthSlider = ui.getByLabelText(/Focal Depth/i) as HTMLInputElement;
  assert.ok(depthSlider);
  assert.equal(depthSlider.min, '5');
  assert.equal(depthSlider.max, '50');

  // Virtual Gain slider
  const gainSlider = ui.getByLabelText(/Virtual System Gain/i) as HTMLInputElement;
  assert.ok(gainSlider);
  assert.equal(gainSlider.min, '0');
  assert.equal(gainSlider.max, '80');

  // Element Aperture buttons
  assert.ok(ui.getByRole('button', { name: /16 Elements/i }));
  assert.ok(ui.getByRole('button', { name: /32 Elements/i }));
  assert.ok(ui.getByRole('button', { name: /64 Elements/i }));

  // Sound path, True depth, and ASME code metrics are visible
  assert.ok(ui.getByText(/Sound Path \(S\):/i));
  assert.ok(ui.getByText(/True Depth \(D\):/i));
  assert.ok(ui.getByText(/ASME STATUS:/i));
});

test('PautInspectorController allows interactive adjustment of beam angle, gain, and defect selection', () => {
  const ui = render(<PautInspectorController language="en" />);

  // Change Beam Angle to 60 via preset button
  const btn60 = ui.getByRole('button', { name: '60°' });
  fireEvent.click(btn60);
  assert.ok(ui.getByText(/BEAM: 60°/i));

  // Change Virtual Gain via +6dB button
  const plus6Btn = ui.getByRole('button', { name: '+6 dB' });
  fireEvent.click(plus6Btn);

  // Switch defect from Crack to Porosity
  const porosityBtn = ui.getByRole('button', { name: /Porosity/i });
  fireEvent.click(porosityBtn);

  // Verify defect name updated in display
  assert.ok(ui.getByText(/Select Target Defect from Simulated UT Database:/i));
  assert.ok(ui.getAllByText(/Porosity/i).length > 0);
});

test('PautInspectorController renders properly in Arabic locale', () => {
  const ui = render(<PautInspectorController language="ar" />);

  // Check Arabic titles and labels
  assert.ok(ui.getByText(/وحدة التحكم بمفتش المصفوفات الطورية/i));
  assert.ok(ui.getByText(/زاوية الشعاع/i));
  assert.ok(ui.getByText(/إعدادات قانون التركيز/i));
  assert.ok(ui.getByText(/التحكم الافتراضي بالكسب/i));
  assert.ok(ui.getByText(/المسار الصوتي/i));
});

test('EducationalAcademy mounts PautInspectorController when initialSubTab is paut_controller', () => {
  const ui = render(<EducationalAcademy language="en" initialSubTab="paut_controller" />);

  assert.ok(ui.getAllByText(/PAUT INSPECTOR CONTROLLER/i).length > 0);
  assert.ok(ui.getByLabelText(/Beam Angle/i));
});
