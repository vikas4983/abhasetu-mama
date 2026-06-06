import { test, expect } from '@playwright/test';

test.describe('Doctor Consultation Single-Page Dashboard E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Appointments / Doctor Consultation page
    await page.goto('/appointments');
  });

  test('should load the dashboard layout, filters, and display empty state', async ({ page }) => {
    // Check page header
    await expect(page.locator('h2')).toContainText('Interoperable Doctor Consultations');
    
    // Check left pane filters exist
    await expect(page.locator('button:has-text("All Systems")')).toBeVisible();
    await expect(page.locator('button:has-text("Modern Medicine")')).toBeVisible();
    await expect(page.locator('button:has-text("Traditional Medicine (AYUSH)")')).toBeVisible();
    
    // Check right pane shows selection placeholder
    await expect(page.locator('h4:has-text("Configure Booking Slot")')).toBeVisible();
    await expect(page.locator('text=Select any verified doctor from the catalog')).toBeVisible();
  });

  test('should allow filtering doctors and selecting a practitioner to book', async ({ page }) => {
    // Click on Traditional Medicine filter
    await page.click('button:has-text("Traditional Medicine (AYUSH)")');
    
    // Find a homeopathy or ayurveda doctor card and select it
    const selectBtn = page.locator('button:has-text("Select & Book")').first();
    await expect(selectBtn).toBeVisible();
    await selectBtn.click();
    
    // Check if the booking form opened in the right pane
    await expect(page.locator('h4:has-text("Configure Appointment")')).toBeVisible();
    await expect(page.locator('text=Select Date')).toBeVisible();
    await expect(page.locator('text=Select Time Slot')).toBeVisible();
    
    // Fill out active symptoms
    await page.fill('input[placeholder="e.g. fatigue, sore throat since yesterday"]', 'Mild fever and fatigue since yesterday');
    
    // Click Pay & Book button
    await page.click('button:has-text("Pay & Issue OPD Token")');
    
    // Check for payment settlement confirmation and token ticket
    await expect(page.locator('text=CHECKOUT SETTLED')).toBeVisible();
    await expect(page.locator('text=OPD APPOINTMENT TOKEN')).toBeVisible();
    
    // Enters ABHA linkage details
    await expect(page.locator('h4:has-text("ABHA Integration Binds")')).toBeVisible();
    await page.fill('input:below(:text("Patient Registered Name"))', 'Dr. Ayesha Ali');
    await page.fill('input:below(:text("ABHA Address (Health ID)"))', 'ayesha.ali.9981057765@abdm');
    
    // Click discovery check button
    await page.click('button:has-text("Verify & Discover Care Contexts")');
    
    // Verify OTP input field displays
    await expect(page.locator('text=Enter NHA Verification OTP')).toBeVisible();
    
    // Fill test OTP
    await page.fill('input[placeholder="123456"]', '123456');
    await page.click('button:has-text("Confirm")');
    
    // Check care context registration success
    await expect(page.locator('text=Care Context Registered!')).toBeVisible();
    
    // Join video consultation room
    await page.click('button:has-text("Join Consultation Room")');
    
    // Verify video room states and chat simulator
    await expect(page.locator('text=Consultation Session')).toBeVisible();
    await expect(page.locator('text=Telehealth Chat Box')).toBeVisible();
    await expect(page.locator('text=LIVE')).toBeVisible();
    
    // Type and send a chat message
    await page.fill('input[placeholder="Type symptom detail or query..."]', 'I have headache also.');
    await page.click('button:has-text("Type symptom detail or query...") + button');
    
    // Verify message appears in chat history
    await expect(page.locator('text=I have headache also.')).toBeVisible();
  });
});
