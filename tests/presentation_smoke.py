from playwright.sync_api import sync_playwright, expect
import sys
from pathlib import Path

Path('qa-evidence').mkdir(exist_ok=True)
base=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8659/AI-Demonstration/'
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
 for width in [1440,390]:
  page=b.new_page(viewport={'width':width,'height':900})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  def go(path):
   page.goto(base+path,wait_until='networkidle')
   if errors:
    import difflib
    plain=b.new_page(java_script_enabled=False)
    plain.goto(base+path)
    def words(tab):
     return tab.locator('body').inner_text().split()
    print(list(difflib.unified_diff(words(plain),words(page),n=2))[:100],path,flush=True)
    plain.close()
  def button(s):return page.get_by_role('button',name=s,exact=True)
  def nav(s):
   if width<500:
    page.locator('header button[aria-label^="Open"]').first.click()
   page.locator('aside nav').get_by_role('button',name=s,exact=True).click()
  go('')
  assert page.get_by_label('Simulate user role').input_value()=='cfo'
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), page.locator('body *').evaluate_all('(els) => els.filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0,15).map(el=>[el.tagName,el.className,el.getBoundingClientRect().right])')
  page.screenshot(path=f'qa-evidence/finance-{width}.png')
  period=page.get_by_label('Reporting period')
  period.select_option('fy2025')
  annual=page.locator('.brief-figures dd').all_text_contents()
  button('Open board pack').click()
  expect(page.locator('.report-cover')).to_contain_text('Full year 2025')
  assert page.locator('.chart-column').count()==12
  expect(page.locator('.report-stat-row strong').first).to_have_text(annual[0])
  nav('CFO decision studio')
  expect(page.get_by_label('Period',exact=True)).to_have_value('fy2025')
  page.get_by_label('Period',exact=True).select_option('2026-q1')
  nav('Board reporting brief')
  expect(period).to_have_value('2026-q1')
  period.select_option('q3')
  q=page.locator('.brief-figures dd').all_text_contents()
  period.select_option('oct')
  octv=page.locator('.brief-figures dd').all_text_contents()
  assert q!=octv
  button('Open board pack').click()
  assert page.get_by_label('Reporting period').input_value()=='oct'
  assert page.locator('.report-stat-row strong').first.inner_text()==octv[0]
  expect(button('Approve draft')).to_be_disabled()
  nav('Data foundations')
  button('Inspect evidence').click()
  assert 'GL-2105' in page.locator('.evidence-card').inner_text()
  button('Acknowledge exception').click()
  nav('Board pack studio')
  button('Approve draft').click()
  assert 'Approved demo' in page.locator('.report-meta').inner_text()
  page.get_by_label('Reporting period').select_option('q3')
  expect(button('Approve draft')).to_be_enabled()
  page.pdf(path=f'qa-evidence/board-{width}.pdf',format='A4')
  nav('Board reporting brief')
  for t in ['Collect','Validate','Calculate','Review']:
   page.get_by_role('tab',name=t,exact=False).click()
  page.get_by_label('Simulate user role').select_option('sales')
  assert page.locator('.brief-figures').count()==0
  go('demos/ai-assessment/')
  assert page.get_by_role('heading',name='Automation opportunity review').is_visible()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), page.locator('body *').evaluate_all('(els) => els.filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0,15).map(el=>[el.tagName,el.className,el.getBoundingClientRect().right])')
  page.screenshot(path=f'qa-evidence/kenny-{width}.png')
  button('Open assessment report').click()
  expect(page.locator('article')).to_be_visible()
  for s in ['Discovery & intake','Process mapping','AI opportunities','ROI & economics','Implementation roadmap','Meeting & proposals','NDA & governance','Client deliverables']:
   nav(s)
   assert page.locator('main').inner_text().strip()
  go('demos/wigwam-finance/')
  meeting=page.get_by_role('navigation',name='Meeting presentation')
  expect(page.get_by_role('heading',name='Accounts Payable',exact=True)).to_be_visible()
  expect(page.get_by_role('heading',name='Current workflow')).to_be_visible()
  expect(page.get_by_role('heading',name='What we could improve')).to_be_visible()
  expect(page.get_by_role('heading',name='Questions arising from the workflow')).to_be_visible()
  expect(page.get_by_role('heading',name='Email → Hubdoc')).to_be_visible()
  assert page.locator('textarea').count()==0
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert meeting.get_by_role('button').count()==6
  for tab,heading in [('Bank Reconciliation','Bank Reconciliation'),('Financial Reporting','Financial Reporting'),('AI Agents','Seven agents. One coordinated workflow.'),('Feasibility & security','Feasibility, security and operating costs.'),('Platform example','Your own finance workspace.')]:
   meeting.get_by_role('button',name=tab,exact=False).click()
   expect(page.get_by_role('heading',name=heading,exact=True)).to_be_visible()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  meeting.get_by_role('button',name='AI Agents',exact=False).click()
  specialist=page.get_by_role('group',name='Seven agent workflows')
  expect(specialist.get_by_role('button')).to_have_count(7)
  for i,title in enumerate(['Entity Allocation Agent','Purchase Order Agent','AP Exception Assistant','Bank Reconciliation Agent','Card Spend Control Agent','Financial Reporting Agent','Financial Monitoring Agent']):
   specialist.get_by_role('button').nth(i).click()
   expect(page.get_by_role('heading',name=title,exact=True)).to_be_visible()
  specialist.get_by_role('button').nth(0).click()
  expect(page.get_by_role('heading',name='Supplier invoice · INV-1042')).to_be_visible()
  page.get_by_label('Proposed Xero company').select_option('Property B')
  page.get_by_label('Proposed PO').select_option('PO-204')
  page.get_by_role('button',name='Re-run sample checks').click()
  expect(page.get_by_text('3 of 3 sample checks passed',exact=True)).to_be_visible()
  specialist.get_by_role('button').nth(1).click()
  expect(page.get_by_text('3 of 3 sample checks passed',exact=True)).to_be_visible()
  page.screenshot(path=f'qa-evidence/wigwam-agents-{width}.png')
  meeting.get_by_role('button',name='Platform example',exact=False).click()
  expect(page.get_by_text('7 / 7',exact=True)).to_be_visible()
  page.get_by_role('textbox',name='Ask finance assistant').fill('Show invoice INV-1042')
  page.get_by_role('button',name='Ask',exact=True).click()
  expect(page.get_by_role('heading',name='Invoice INV-1042 · evidence and review')).to_be_visible()
  page.get_by_label('Proposed Xero company').select_option('Property B')
  page.get_by_label('Proposed PO').select_option('PO-204')
  page.get_by_role('button',name='Re-run checks',exact=True).click()
  expect(page.get_by_text('Validation complete; awaiting existing human approval.',exact=True)).to_be_visible()
  page.get_by_role('combobox',name='View as').select_option('director')
  expect(page.get_by_role('button',name='Show invoice INV-1042')).to_have_count(0)
  page.get_by_role('textbox',name='Ask finance assistant').fill('Show invoice INV-1042')
  page.get_by_role('button',name='Ask',exact=True).click()
  expect(page.get_by_role('status')).to_contain_text('restricted')
  page.get_by_role('button',name='View investor report').click()
  expect(page.get_by_role('heading',name='Quarterly investor report · draft')).to_be_visible()
  page.get_by_label('Reporting period').select_option('Q2 2026')
  expect(page.get_by_text('£286,000',exact=True)).to_be_visible()
  page.screenshot(path=f'qa-evidence/wigwam-platform-{width}.png')
  meeting.get_by_role('button',name='Accounts Payable',exact=False).click()
  page.screenshot(path=f'qa-evidence/wigwam-meeting-{width}.png')
  assert not errors,errors
  print('Verified',width,base,q,octv,flush=True)
  page.close()
 b.close()
