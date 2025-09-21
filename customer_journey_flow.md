## Customer Journey Management – Flow Diagrams

### Story CJ-001: Customer Registration and Onboarding
```mermaid
flowchart TD
  start([Start]) --> reg[Registration page]
  reg --> enter[Enter email, phone, password, company details]
  enter --> email{Email unique?}
  email -- No --> email_err[Show error: email already exists]
  email_err --> enter
  email -- Yes --> phone{Phone valid UAE/GCC format?}
  phone -- No --> phone_err[Show error: invalid phone]
  phone_err --> enter
  phone -- Yes --> pass{Password meets security reqs?}
  pass -- No --> pass_err[Show error: weak password]
  pass_err --> enter
  pass -- Yes --> acct[Create account (pending verification)]
  acct --> codes[Send email and SMS verification codes]
  codes --> verify_page[Redirect to verification page]
  verify_page --> input_codes[Enter both verification codes]
  input_codes --> codes_valid{Codes valid?}
  codes_valid -- No --> code_err[Show error: invalid/expired codes]
  code_err --> attempts{Attempts >= 3?}
  attempts -- Yes --> lock[Lock account for 24 hours]
  lock --> end([End])
  attempts -- No --> resend[Allow resend after 60s; re-enter]
  resend --> verify_page
  codes_valid -- Yes --> active[Activate account; auto-login]
  active --> profile[Redirect to profile completion]
  profile --> complete[Complete mandatory fields: license, billing address, contact person]
  complete --> mandatory{All mandatory provided?}
  mandatory -- No --> fix_mandatory[Prompt to complete required fields]
  fix_mandatory --> complete
  mandatory -- Yes --> access[Mark profile complete; enable full booking]
  access --> kyc{KYC documents uploaded?}
  kyc -- No --> end
  kyc -- Yes --> scan[Virus scan and validate documents]
  scan --> scan_ok{Scan/validation passed?}
  scan_ok -- No --> reupload[Reject; prompt to re-upload]
  reupload --> kyc
  scan_ok -- Yes --> under_review[Set status "Under Review"; notify admin; send confirmation email]
  under_review --> end
```

### Story CJ-002: Advanced Booking Request Creation
```mermaid
flowchart TD
  start([Start]) --> page[Create booking page]
  page --> locations[Enter pickup and delivery (search/map)]
  locations --> in_area{Both locations within service areas?}
  in_area -- No --> area_err[Error: outside service areas]
  area_err --> locations
  in_area -- Yes --> dist_ok{Distance 1–1000 km?}
  dist_ok -- No --> dist_err[Error: invalid distance (<1 or >1000 km)]
  dist_err --> locations
  dist_ok -- Yes --> geocode{Geocoding accuracy OK?}
  geocode -- No --> geocode_err[Refine address]
  geocode_err --> locations
  geocode -- Yes --> route[Show route distance and estimated travel time; highlight service areas]
  route --> cargo[Enter cargo type, weight, dimensions, special requirements]
  cargo --> compatible{Weight/dimensions compatible?}
  compatible -- No --> comp_err[Error: cargo exceeds limits]
  comp_err --> cargo
  compatible -- Yes --> suggest[Suggest/filter compatible truck types]
  suggest --> special{Any special requirements?}
  special -- Yes --> reqs[Hazardous cert; refrigerated temp; fragile confirmation]
  reqs --> fees1[Calculate special handling fees]
  fees1 --> schedule
  special -- No --> schedule[Select preferred pickup/delivery slots]
  schedule --> availability[Check driver/truck availability]
  availability --> slots[Highlight available slots]
  slots --> surcharges[Apply surcharges: express 50%, weekend/holiday 25%, peak 15%]
  surcharges --> instructions[Add special instructions (contacts, access, equipment)]
  instructions --> instr_ok{Instructions complete?}
  instr_ok -- No --> instr_err[Prompt to complete instructions]
  instr_err --> instructions
  instr_ok -- Yes --> fees2[Calculate additional costs; flag requirements]
  fees2 --> quote[Request quote]
  quote --> pricing[Compute pricing: base, distance/km, weight/kg, special, time-based, fuel, VAT]
  pricing --> display[Display quote within 5s; show breakdown; valid 24h]
  display --> end([End])
```

### Story CJ-003: Smart Truck Selection and Booking Confirmation
```mermaid
flowchart TD
  start([Start]) --> have_quote{Quote available?}
  have_quote -- No --> back[Complete booking details and request quote]
  back --> have_quote
  have_quote -- Yes --> search[Search available trucks]
  search --> filter[Filter by cargo compatibility]
  filter --> list[Display trucks with details, driver info, ratings, pricing, ETA; sort by best match]
  list --> compare{Compare trucks?}
  compare -- Yes --> compare_view[Select up to 3; side-by-side comparison]
  compare_view --> choose[Choose truck]
  compare -- No --> choose[Choose truck]
  list --> view_driver{View driver profile?}
  view_driver -- Yes --> profile[Show driver profile, reviews, performance metrics, certifications]
  profile --> list
  view_driver -- No --> list
  choose --> review[Review booking summary]
  review --> payment[Select payment method (card, bank transfer, credit terms, etc.)]
  payment --> terms[Accept terms and conditions]
  terms --> confirm[Confirm booking; generate unique reference]
  confirm --> notify[Send confirmation via email and SMS]
  notify --> modify{Modify or cancel booking?}
  modify -- No --> end([End])
  modify -- Yes --> timing{Time before pickup?}
  timing --> fees[Apply rules: free >24h; 10% within 24h; 25% cancellation <24h; 50% cancellation <2h; no refund for no-show]
  fees --> notify_driver[Notify driver automatically]
  notify_driver --> is_cancel{Cancellation?}
  is_cancel -- Yes --> refund[Initiate refund process if applicable]
  refund --> end
  is_cancel -- No --> end
```

### Story CJ-004: Real-time Shipment Tracking
```mermaid
flowchart TD
  start([Start]) --> assigned{Booking confirmed and driver assigned?}
  assigned -- No --> wait[Wait for assignment]
  wait --> assigned
  assigned -- Yes --> tracking[Open tracking page]
  tracking --> map[Show live GPS map; update every 30s; route and ETA updates]
  map --> status{Status change?}
  status -- Yes --> updates[Update status timeline; send SMS/push notifications]
  updates --> map
  status -- No --> contact{Need to contact driver?}
  contact -- Yes --> comm[Call (masked), in-app message, voice, photo; emergency contact]
  comm --> map
  contact -- No --> map
  map --> delivered{Delivery completed?}
  delivered -- No --> map
  delivered -- Yes --> pod[Delivery confirmation; proof of delivery (photos, signature)]
  pod --> invoice[Generate and send invoice automatically]
  invoice --> analytics[Show trip analytics; allow rating and feedback]
  analytics --> store[Store trip data for future reference and disputes]
  store --> end([End])
```

