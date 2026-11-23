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
  assert not errors,errors
  print('Verified',width,base,q,octv,flush=True)
  page.close()
 b.close()
