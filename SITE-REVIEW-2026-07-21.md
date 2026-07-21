# Ayers Home client-site review

**Reviewed:** July 21, 2026  
**Site:** `http://localhost:4321`  
**Scope:** rendered copy, navigation, links, missing content, model-data consistency, and building-science/engineering claims.

## Executive summary

The report is visually coherent and its primary navigation is sound, but it is **not ready for client release**. Three issues should be treated as release blockers:

1. The recommended **Passive House** variant is described as meeting Phius targets even though the displayed model data show a clear Net Source Energy failure and additional space-conditioning misses.
2. The **resilience page combines incompatible analysis runs** and states winter and summer compliance that the embedded plots do not demonstrate.
3. The **room-airflow table has invalid area/volume/height data** and mixes a large kitchen-hood flow into the balanced-ventilation schedule.

There are also several internal contradictions—especially fuel types, number of variants, and ERV/HRV terminology—plus one broken external code link, one incorrectly centered map link, a missing Level 03 plan, and a moderate number of copyediting errors.

## What was verified

- Loaded Summary, Energy Model, Building Envelope, Windows, Mechanical, and Resilience in the rendered site.
- Confirmed the main navigation appears on every page.
- Confirmed all 28 internal hash links resolve to an existing element.
- Confirmed all locally referenced `/assets` and `/downloads` files exist.
- Found no missing-variable placeholders and no browser-console errors during the route walk-through.
- Tested the visible external links. Most opened successfully; exceptions are noted below.
- Compared rendered claims against `data/energy.csv`, `data/certification.csv`, `data/room-airflows.csv`, `data/variants.csv`, `public/downloads/resilience/resilience.json`, the embedded Plotly data, and the project configuration.

## Release blockers

### 1. Recommended variant is presented as Phius-compliant, but it is not

`content/energy-model/model-variants.mdx:36-40` says the recommended Passive House variant “meets” Phius targets. The model results do not support that statement:

| Metric | Passive House result | Displayed limit | Difference |
|---|---:|---:|---:|
| Net Source Energy | 42,599 kWh/yr | 34,350 kWh/yr | 24.0% over |
| Net Source Energy per person | 7,100 kWh/person-yr | 5,725 kWh/person-yr | 24.0% over |
| Annual heating demand | 11,557 kWh/yr | 10,881 kWh/yr | 6.2% over |
| Peak cooling load | 4,322 W | 3,654 W | 18.3% over |

The certification table also leaves **Certification Compliant?** blank for the first five variants and displays a literal hyphen for Passive House (`data/variants.csv:788-793`). An empty result is especially misleading beside the “meets” claim.

**Required correction:** either revise the model/variant until the applicable target is met, or describe this as the recommended **design direction** and state the remaining target gaps explicitly. Populate the compliance field from a validated rule set or suppress it. Do not imply certification; `project.yaml:11-12` correctly says “Design analysis only” and “Not submitted.”

The explanatory Phius accordion also uses hard-coded generic limits—7.3/6.9 kBtu/ft²-yr, 5.4/2.5 Btu/h-ft², and 5,400 kWh/person-yr—that conflict with this report's project-specific limits of 9.7/8.2, 6.5/3.3, and 5,725. The generic values come from `bt-web-report-template/src/components/PassiveHouseCertificationsInfo.astro:53-73`, outside this project folder. Phius 2024 space-conditioning criteria are project-specific, and NSE varies with occupancy/building size; use the project's calculated targets. See the [Phius Certification Guidebook v24.1.1](https://www.phius.org/sites/default/files/2024-09/Phius%20Certification%20Guidebook%20v24.1.1%20%281%29.pdf).

### 2. Resilience plots, source manifest, and narrative are from incompatible runs

The rendered Plotly files and `public/downloads/resilience/resilience.json` do not describe the same analysis:

- Embedded plots use a **2021** nine-day series with six zones.
- The JSON manifest describes **2016** outage periods and only a “Whole House” summer series.
- The manifest still points to `summer-heat-index.csv` and `winter-set.csv`, but those source downloads are absent from the current worktree and the MDX source links have been removed.
- The embedded plots contain 216 hours while the narrative describes a seven-day outage. The plot appears to include a 24-hour preconditioning period, but the client is not told which interval is evaluated.

The compliance conclusions are also incorrect for the data currently embedded:

- **Summer:** five habitable zones record 9–33 hours in the **Danger** heat-index band. The page says the building complies because it has zero **Extreme Danger** hours. Phius REVIVE requires zero hours in both Danger **and** Extreme Danger for each thermal block, plus zero deadly days. The assessment callout says the summer case fails, contradicting the later compliance statement.
- **Winter:** the embedded plot reaches roughly 4.2–9.1°C SET in the habitable zones, not “never below 14°C.” Four of five habitable zones exceed the 216°F·h-below-54°F limit, although none falls below 2°C. The conclusion that winter is compliant and needs no modification is not supported by this plotted run.

These criteria are stated in the [Phius REVIVE 2024 Standard v24.1.1](https://www.phius.org/sites/default/files/2024-09/Phius%20REVIVE%202024%20Standard%20v24.1.1%20%281%29.pdf).

`content/custom/resilience/assessment.mdx:8,24-26` also calls this home an “end-of-row unit” and refers to “other homes.” That is leftover multifamily/townhouse language and conflicts with the single-family project description.

**Required correction:** select one authoritative resilience run; regenerate the plots, metrics, prose, manifest, and downloadable sources from it; identify the outage interval; report Danger and Extreme Danger hours by thermal block; report both winter criteria; then rewrite the recommendations from the validated results.

### 3. Room-airflow schedule contains impossible geometry and conflates systems

The Mechanical page labels its columns ft², ft³, and feet, but `data/room-airflows.csv` contains physically impossible combinations. Examples include:

- Crawlspace: 1,392 ft² and 106 ft³.
- Living + Dining: 625 ft² and 130 ft³.
- Kitchen: 251 ft² and 52.4 ft³.
- Most listed room heights are `0.20828 ft`.
- Total scheduled area is 6,462 ft², compared with 3,778 ft² TFA.

This looks like an incomplete or mislabeled metric-to-IP conversion. The schedule also adds a 624 cfm kitchen-hood row to the ERV airflow total, producing approximately 834/835 cfm at high speed versus 162/163 cfm at medium speed. A Zehnder Q600 has a nominal maximum of 600 m³/h (about 353 cfm), so it cannot provide the combined high-flow total. The range hood must be shown as a separate exhaust/makeup-air system, not as part of the balanced ERV total. See the [Zehnder Q-series service data](https://zehnderamerica.com/wp-content/uploads/2024/08/ComfoAir_Q_Service_Zehnder-America_EN_2022.05.18.pdf).

**Required correction:** repair the unit conversion and geometry mapping, distinguish TFA from gross/ventilated area, separate normal/boost ERV flow from range-hood exhaust, and check Q600 selection at the actual design point and external static pressure.

## High-priority technical and data corrections

### Energy-model logic and fuel types

- `content/energy-model/site-energy.mdx:12` says five variants; the report contains six.
- `site-energy.mdx:14` compares the results with the “existing” home, but there is no existing-home variant. Replace with the actual baseline (apparently Code Minimum) or add a documented existing-condition model.
- `model-variants.mdx:10-34` says the first four variants retain gas heating/hot water and that variants 5–6 retain gas cooking. `co2-emissions.mdx:24-25` instead says **all** variants use electric heat pumps.
- `data/energy.csv` confirms boiler heat in the first four variants and heat pumps only in the last two. It also shows zero cooking energy and zero cooking CO2 for every variant. The operational-carbon totals therefore omit the gas cooking described in the narrative.
- “Add a Basic ERV” is modeled with zero recovery efficiency and an HRV/balanced-unit label in the data. Decide whether this variant represents balanced ventilation without recovery, an HRV, or an ERV, and align its name, inputs, and narrative.
- The Summary should disclose major target misses. “6 variants tested / Passive House recommended” currently reads as a successful result rather than a design recommendation with open gaps.
- `project.yaml:13` leaves `recommended_variant_id` null while the generated manifest identifies `passive_house` as recommended. Define one authoritative value so a rebuild cannot silently change the recommendation.

### Resilience methodology and recommendations

- “End-of-row unit,” “other homes,” and plural-building recommendations are clearly copied from another project.
- “Relying only on passive measures alone” is redundant.
- Use **resilience**, not alternating “resilience/resiliency.”
- Explain why the summer assessment uses heat index and the winter assessment uses SET, and identify which spaces/thermal blocks are subject to the criteria.
- Separate criterion-based compliance from broader risk commentary. A zone can avoid Extreme Danger and still fail REVIVE because it enters Danger.

### Ventilation and mechanical systems

- “There is no effective method of combining fresh-air ducting with heating/cooling ducting” is too absolute. Integrated systems exist; if separate distribution is preferred here, state the project-specific reasons—airflow mismatch, control, filtration, balancing, acoustics, or commissioning.
- Transfer openings do not inherently reduce sound transmission. They can create a direct flanking path unless they are acoustically treated. Qualify the acoustic claim.
- Fresh-air equipment must be checked against the whole-building/occupancy requirement **and** room supply/extract criteria; the room-by-room schedule is not a substitute for the governing whole-building rate.
- The selected unit is alternately called an ERV and HRV. Use the actual Q600 exchanger configuration consistently.
- The statement that the selected system filters “incoming and outgoing air to MERV-13” is inaccurate. Zehnder lists the outdoor-air filter as F7/MERV 13 and the extract-air filter as G4/MERV 8.
- The Passive House ventilation requirements repeat the same ±10% balance requirement twice.
- Kitchen recommendations should clearly state the selected hood flow, the applicable code-triggered makeup-air requirement, and the relationship to the 200–400 cfm recommendation. A 624 cfm modeled hood conflicts with the current prose.
- Four commissioning steps at the bottom of the kitchen section render as one long numbered item; format them as four Markdown list items.
- Level 03 mechanical-plan PDF/PNG assets exist in `public/assets/mechanical/`, but the page only presents Levels 00, 01, and 02. Add Level 03 or remove the orphaned assets if it is intentionally excluded.

### Envelope and airtightness

- “The primary role of airtightness is to avoid interstitial condensation” is too narrow. Moisture durability is important, but airtightness also controls energy use, drafts/comfort, pollutant transport, and pressure-driven airflow. Say “one key durability role.”
- ACH50 and operating infiltration are not simply interchangeable. Recast the “simple linear relationship” as a modeling assumption under fixed exposure and pressure coefficients.
- Use “≤3 ACH50” rather than “less than 3 ACH50” for the code limit unless a Rhode Island amendment specifically makes the criterion strict.
- Calling 1.0 ACH50 the “Passive House target” is incomplete for a Phius comparison. Phius uses 0.06 cfm50/ft² of enclosure area. Based on the displayed 35,315 ft³ volume and 12,801 ft² enclosure, 1.0 ACH50 is about 0.046 cfm50/ft² and is therefore more stringent; state both metrics and which one controls.
- The AeroBarrier paragraph begins “For existing buildings.” Verify that this belongs in a new-design report and, if retained, distinguish retrofit from pre-drywall application.
- The UpCodes URLs currently show an error page. Prefer the official [Rhode Island Energy Conservation Code](https://rules.sos.ri.gov/Regulations/part/510-00-00-8) and ICC text, and confirm that every code-year statement is aligned with the adopted 2024 IECC and Rhode Island amendments.

### Windows and summer comfort

- The blanket recommendation for **low SHGC on all south-facing glazing** conflicts with the same page's winter-solar-gain strategy and with the model's apparent uniform SHGC of 0.40. Optimize SHGC and exterior shading by orientation and glazing fraction instead of prescribing uniformly low south SHGC.
- Interior blinds reduce solar load less effectively than exterior shading because the solar energy has already entered the enclosure. The page later acknowledges this; reconcile the earlier recommendation and prioritize exterior control where practicable.
- The 4.2 K surface-temperature-difference statement is presented as a broad comfort fact. Identify it as the specific PHI comfort criterion being used, cite it, and avoid implying that radiant asymmetry alone fully predicts comfort.

### Climate and location

- Providence TMY3 is described as the “nearest weather station.” Groton/New London is geographically closer to Westerly. If Providence is the selected PHPP climate dataset, say that and explain the basis for selection and the +2 K summer correction.
- The OpenStreetMap link centers at `38.01, -95.84`, in the central United States, not Westerly, Rhode Island. Replace it with the project coordinates or remove it.

## Editorial corrections by page

### Energy Model

- `model-variants.mdx:18`: “This versions represents” → “This version represents.”
- `model-variants.mdx:31`: remove the quotation marks from link text `'heat-pumps'`; use **heat pumps**.
- `model-variants.mdx:31`: “Heat Pump equipment is” → “Heat-pump equipment is” or “Heat pumps are.”
- `model-variants.mdx:36`: use the current **Phius** name/branding rather than “Passive House Institute of the US (PHIUS).”
- `model-variants.mdx:38`: “high performance ERV” → “high-performance ERV.”
- `model-variants.mdx:39`: “envelop airtightness” → “envelope airtightness.”
- `site-energy.mdx:9-10`: use **hot water**, **electric vehicles**, and **pumps/fans** without unnecessary noun hyphens/spaces.
- `co2-emissions.mdx:7-9`: repair subject agreement: “Carbon dioxide and other pollutants resulting from energy consumption are…”
- `co2-emissions.mdx:9`: “related to the buildings” → “related to buildings.”
- `co2-emissions.mdx:22-23`: use **hot water**, **plug loads**, and **end use**.
- `co2-emissions.mdx:27`: “Output Emission Rates” → “Output emission rates.”
- Consider citing or softening the 2.3 tCO2e/person 2030 budget and 4-ton transatlantic-flight examples; both are presented as universal values without source or boundary definition.

### Building Envelope

- EW-1, EW-2, EW-3, and EW-4 each contain an opening parenthesis before “behind the continuous insulation” with no closing parenthesis.
- FC-1 renders **“1 5 Mil StegoHome”** from malformed `Use 1[5 Mil StegoHome]`; change to the intended membrane thickness, apparently **15 mil StegoHome**.
- IW-1 and FC-2: “betwen” → “between.”
- FC-2: “Recommened” → “Recommended.”
- Replace abbreviated “sim.” with “similar” in client-facing assembly prose.

### Windows

- “Many engineering reference standards suggests” → “Many engineering reference standards suggest.”
- `4.2°K` → `4.2 K`; kelvin differences do not use a degree symbol.
- Remove unnecessary hyphens in **air temperature**, **relative humidity**, and **cold surfaces**.
- “highly glazed rooms or space” → “highly glazed rooms or spaces.”
- “will lead to reduce thermal comfort” → “will lead to reduced thermal comfort.”
- “useful shaded” → “useful shade.”
- “south facing” → “south-facing.”
- “Google maps” → “Google Maps.”

### Mechanical

- Use **airflow**, **airtight**, and **high-quality** consistently.
- Kitchen: “placement effect performance” → “placement affects performance.”
- Kitchen: `etc..` → `etc.`
- “several good, self-modulating makeup air system… heater… which” → plural **systems/heaters** and **that**.
- “For Gas cooking” → “For gas cooking.”
- Reconcile the recommendation to avoid indoor combustion with the recommended variant's retained gas cooking.

### Resilience

- “exceptional well insulated” → “exceptionally well-insulated.”
- Remove unnecessary hyphens in **power outage**, **test period**, and **weather conditions**.
- Standardize quote marks around “end-of-row”; the current opening/closing marks do not match.

### Summary and Climate

- “assessment modeling” is awkward; use “assessment details, key results, and supporting analysis.”
- “The climate data is all” → “The climate data are.”
- Add a comma before “however” where it joins independent clauses.
- `project.yaml:7` dates the report July 24, 2026, three days after this review. Keep it if that is the intended issue date; otherwise correct it before publication.
- `project.yaml:70` misspells `target_co2_per_person` as `taget_co2_per_person`. It appears unused, but should be corrected or removed from the schema rather than left as a silent dead value.

## Links and navigation

### Working as expected

- All six primary routes loaded successfully.
- All tested internal section links resolve.
- All locally linked PDFs, images, and downloads currently referenced by the pages exist.
- ENERGY STAR, PHI/Phius, product, monitoring, and general reference links tested successfully, apart from the exceptions below.

### Correct before release

1. **UpCodes:** the report's Rhode Island 2024 IECC links currently open an “Error Loading Page.” Use an official Rhode Island/ICC source or verify replacement UpCodes URLs immediately before publication.
2. **OpenStreetMap:** the map link is centered on the wrong part of the country.
3. **Level 03 plans:** files exist but there is no rendered Level 03 plan section/link.
4. **Resilience source data:** the manifest references CSV downloads that are not present, leaving the plotted analysis without reproducible source data.

## Recommended correction sequence

1. Reconcile the authoritative PHPP variant inputs/results and decide what “recommended” means despite the target gaps.
2. Replace all certification targets and compliance outputs with project-specific validated values.
3. Select and regenerate one authoritative resilience analysis package—plots, metrics, prose, manifest, and source downloads.
4. Repair the room geometry/unit conversions and separate ERV and range-hood airflow schedules.
5. Reconcile fuel types, cooking energy, ERV/HRV terminology, and variant count across all pages.
6. Correct the high-priority engineering wording and missing Level 03 plan.
7. Apply the editorial corrections and replace the broken/misdirected external links.
8. Repeat the rendered route/link/data audit before publishing.
