---
layout: default
title: "2. Changing Nuclear Reaction Rates"
nav_order: 3
---

<script type="text/x-mathjax-config">MathJax.Hub.Config({tex2jax:{inlineMath:[['\$','\$'],['\\(','\\)']],processEscapes:true},CommonHTML: {matchFontHeight:false}});</script>
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"></script>


<!--![](Figures/star_image.png)-->
<!--credit: [Chiavassa et al. 2022](https://ui.adsabs.harvard.edu/abs/2022A%26A...661L...1C/abstract) -->

(This LAB uses version r25.12.1 of MESA)

# 2. Changing Nuclear Reaction Rates

In this section, we will graduate from using our `Intro_MESA_model` model directory, and instead use the provided work directory.  [Changing_rates](https://drive.google.com/file/d/19_R2QITiDjMbPmCc-rnObhKKcITtbohT/view?usp=sharing) MESA work directory.

## Science goal

In this lab, we will focus on the evolution of a 20 M$\_{\odot}$ stellar model from the zero age main-sequence through to core-Helium depletion. We will explore which nuclear reaction rates MESA uses, how to change the rates MESA reads in, and finally we explore the impact of changing the $^{12}$C$(\alpha,\gamma)^{16}$O helium burning reaction rate, and its effect on the core properties of stellar model at core-Helium depletion. These properties are extremely important as the Carbon/Oxygen core mass, $M\_{CO}$, is often used in population synthesis calculations as an input into expressions for determining if the stellar model will form a neutron star to a black hole, and the corresponding remenant mass after the model undergoes core-collapse. See [Fryer et al. 2012](https://ui.adsabs.harvard.edu/abs/2012ApJ...749...91F/abstract),[Ilya et al. 2020](https://ui.adsabs.harvard.edu/abs/2020MNRAS.499.3214M/abstract), [Fryer et al. 2022](https://ui.adsabs.harvard.edu/abs/2022ApJ...931...94F/abstract).


   In this lab we only evolve our stellar models to core-Helium depletion, hence we are $M\_{CO}$ at core-Helium depletion as a proxy for $M\_{CO}$ at core-collapse. These two are not identical, and one must evolve their stellar model to core-collapse if they intend to generate a realistic presupernova stellar structures which can be used to determine the model's final fate. Note that, most population synthesis prescriptions for stellar model fates are based on stellar models run to core collapse with small nuclear reaction networks, which could problematic as the structure of stellar models computed with small approximate networks are not identical those computed with larger, more physically accurate networks.

## Evolving to Core-Helium Depletion

To begin, please make sure to download a copy of the desired [changing_rates](https://drive.google.com/file/d/19_R2QITiDjMbPmCc-rnObhKKcITtbohT/view?usp=sharing) MESA work directory.
This work directory is a slightly modified version of the `$MESA_DIR/star/test_suite/20M_pre_ms_to_cc` test_suite.

Once downloaded, you can decompress the file by
```shell-session
unzip changing_rates.zip
```

`tree ./changing_rates` should return the following.

```shell-session
├── clean
├── history_columns.list
├── profile_columns.list
├── inlist
├── inlist_common
├── inlist_mass_Z_wind_rotation
├── inlist_pgstar
├── inlist_project
├── make
│   └── makefile
├── mk
├── rate_tables
│   ├── c12ag_deboer_sigma_0p0_2000_Tgrid.dat
│   ...
├── re
├── re_nomodfiles
├── README.rst
├── rn_nomodfiles
├── run_lab
├── src
│   ├── run_star_extras.f90
│   └── run.f90
└── zams.mod

```

All relevent files are briefly described in the table below

### MESA STAR work directory

| Filename                | Description       |
|:------------------------|:------------------|
| `clean`                 | A bash file for cleaning the model directory.       |
| `inlist`                | The header inlist which points to all other inlists to determine which inlists are read and in what order. |
| `inlist_mass_Z_wind_rotation`                | A supplemental inlist where the mass, metallicity, and mass loss are set. |
| `inlist_project`               | The main inlist which contains controls for the stellar evolution of the model.  |
| `inlist_common`               | The common inlist which contains most of the stellar model physics.     |
| `inlist_pgstar`         | The inlist which controls the pgstar output for each single star.      |
| `make/`                  | A directory containing the makefile.   |
| `mk`                    | A bash file for compiling MESA Star in the model directory.      |
| `history_columns.list`  | A log file which determines which history values are saved in data files as a function of model timestep. |
| `profile_columns.list`  | A log file which determines which profiles values are saved in data files as a function of Mass/radius.     |
| `re`                    | A bash file for restarting the star model executable from photos      |
| `run_lab`                    | A bash file for running the star model executable.      |
| `src/`                   | A directory containing the three files listed below.      |
| `run_star_extras.f90`   | A fortran file which can be modified to agument the stellar evolution routines.     |


`inlist_project`, `inlist_common`, and `inlist_mass_Z_wind_rotation` are the three main files that contain the microphysics information of our stellar evolution simulation.



## Helium Burning Nuclear Reactions

Nuclear Reaction rate uncertainties have a non-negliggable impact on stellar evolution models and their nucleosynthetic products.
See [Iliadis et al. 2011](https://ui.adsabs.harvard.edu/abs/2011ApJS..193...16I/abstract),[Laird](https://ui.adsabs.harvard.edu/abs/2023JPhG...50c3002L/abstract), [Fields et al. 2018](https://ui.adsabs.harvard.edu/abs/2018ApJS..234...19F/abstract),[Farmer et al. 2019](https://ui.adsabs.harvard.edu/abs/2019ApJ...887...53F/abstract) , [Farag et al. 2022](https://ui.adsabs.harvard.edu/abs/2022ApJ...937..112F/abstract), [Pignatari et al. 2023](https://ui.adsabs.harvard.edu/abs/2023EPJA...59..302P/abstract)

For massive star evolution, four of the most uncertain rates are illustrated below (Figure from [Fields et al. 2018](https://ui.adsabs.harvard.edu/abs/2018ApJS..234...19F/abstract))


Some of the most uncertain nuclear reaction rates in nuclear astrophysics are the rates that occur during Helium burning [Deboer et al. 2017](https://ui.adsabs.harvard.edu/abs/2017RvMP...89c5007D/abstract)
<!--![rate uncertainty](Figures/rate_uncertainty.png)-->
<img src="Figures/rate_uncertainty.png" alt="rate uncertainty" width="50%">


That is the triple-$\alpha$ nuclear reaction rates converting Helium into Carbon competes with the c12ag nuclear reaction rate
to set the final Carbon and Oxygen abundance in the stellar core at the end of Helium burning
<img src="Figures/3alpha.png" alt="rate uncertainty" width="50%">
<img src="Figures/c12ag.png" alt="rate uncertainty" width="50%">

<!--![rate uncertainty](Figures/3alpha.png)-->
<!--![rate uncertainty](Figures/c12ag.png)-->

The amount of Carbon and Oxygen in the stellar core is important as it fundamentally changes the nature of Carbon and Oxygen burning, and can have far reaching implications for the resulting presupernova stellar structure and the resulting neutron star, black hole initial mass function. 

The uncertainties in the $^{12}$C$(\alpha,\gamma)^{16}$O reaction rate are among the largest (visualized below)

<img src="Figures/c12ag_uncertainty.png" alt="rate uncertainty" width="50%">
<!--![rate uncertainty](Figures/c12ag_uncertainty.png)-->


## Changing the $^{12}$C$(\alpha,\gamma)^{16}$O rate

MESA's nuclear reaction rates are a combination of NACRE [Angulo et al. 1999](https://ui.adsabs.harvard.edu/abs/1999NuPhA.656....3A/abstract) and JINA REACLIB [Cyburt et al. 2010](https://ui.adsabs.harvard.edu/abs/2010ApJS..189..240C/abstract). Reaction rate screening corrections are from [Chugunov et al. 2007](https://ui.adsabs.harvard.edu/abs/2007PhRvD..76b5028C/abstract), a dynamic screening method which includes a physical parametrization for the intermediate screening regime and reduces to the weak [DeWitt et al. 1973](https://ui.adsabs.harvard.edu/abs/1973ApJ...181..439D/abstract), [Graboske et al. 1973](https://ui.adsabs.harvard.edu/abs/1973ApJ...181..457G/abstract) and strong [Alastuey and Jancovici 1978](https://ui.adsabs.harvard.edu/abs/1978ApJ...226.1034A/abstract), [Itoh et al. 1979](https://ui.adsabs.harvard.edu/abs/1979ApJ...234.1079I/abstract) screening limits at small and large values of the plasma coupling parameter. Weak reaction rates are based, in order of precedence, on [Langanke and Martinez-Pinedo 2000](https://ui.adsabs.harvard.edu/abs/2000NuPhA.673..481L/abstract), [Oda et al. 1994](https://ui.adsabs.harvard.edu/abs/1994ADNDT..56..231O/abstract), and [Fuller et al. 1985](https://ui.adsabs.harvard.edu/abs/1985ApJ...293....1F/abstract).

For hardcoded nuclear reaction rates, the definitions are set and called inside `$MESA_DIR/rates/private/raw_rates.f90`, with definitions for each rate contained inside `$MESA_DIR/rates/private/ratelib.f90`, or drawn from JINA Reaclib / weaklib.

We would like to change our stellar model to adopt one of the $^{12}$C$(\alpha,\gamma)^{16}$O reaction rates provided by `Deboer et al. 2017`. These high resolution nuclear reaction rates are available inside `./rate_tables` or `$MESA_DIR/data/rates_data/rates_tables` directories. By varying this rate, we can explore the temperature dependant uncertainty in this nuclear reaction. 

|:clipboard: TASK|
|:--|
|Pick a value of $\sigma$ for the $^{12}$C$(\alpha,\gamma)^{16}$O rate shown in the figure above. Use a different value than those sitting next you.|
|Change the $^{12}$C$(\alpha,\gamma)^{16}$O reaction rate to one of the Deboer et al. 2017 rates shown in the figure above.|
|Run your model to completion, and report your values in the [google spreadsheet document here](https://docs.google.com/spreadsheets/d/13_nOw6fDVWArYquJWmh0mro1liEgC7_uCfqQcIMxsS0/edit?usp=sharing)|

|:information_source: HINT|
|:--|
|Look inside your local `changing_rates/rate_tables` directory, which was copied from $MESA_DIR/rates/rates_data/rate_tables.|
|To change the rate you are reading you'll have to modify the `rate_list.txt` file|


|&#10067; Questions|
|---|
|Below are some questions to think about using the pgstar movie output from you stellar model.|
|1. During core-Helium burning, what happens to $^{14}$N leftover from core-H burning?|
|2. What do you think should happen to $^{14}$N?|
|3. How does the your chosen c12ag rate effect the final C/O in the core at core-Helium depletion?|
|4. Are we missing any reactions with our simplified approx21 network?|

<details markdown="block">
<summary>Answers: Changing the $^{12}$C$(\alpha,\gamma)^{16}$O reaction rate</summary>

uncomment the rate file you would like to read into MESA inside `change_rates/rate_tables/rate_list.txt`
```
! c12ag rates from debeor et al. 2017 improved with high resolution (mehta et al. 2022) 
! 0 sigma (median c12ag rate)
r_c12_ag_o16   'c12ag_deboer_sigma_0p0_2000_Tgrid.dat'

! positive sigmas (high c12ag)
!r_c12_ag_o16   'c12ag_deboer_sigma_0p5_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_1p0_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_1p5_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_2p0_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_2p5_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_3p0_2000_Tgrid.dat'

! negative sigmas  (lo c12ag)
!r_c12_ag_o16   'c12ag_deboer_sigma_m0p5_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_m1p0_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_m1p5_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_m2p0_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_m2p5_2000_Tgrid.dat'
!r_c12_ag_o16   'c12ag_deboer_sigma_m3p0_2000_Tgrid.dat'
```

A typical evolution of the stellar model should look something like the following

<video width="640" height="480" controls>
  <source src="Figures/0sigma_to_he_deplete.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

The $^{14}$N in the stellar core is quickly converted into $^{20}$Ne, however this is not completely correct. A more detailed nuclear reaction network would accurately capture that  $^{14}$N should convert to $^{22}$Ne via the reaction sequence $^{14}$N$(\alpha,\gamma)^{18}$F$(e^{+},\nu)^{18}$O$(\alpha,\gamma)^{22}$Ne.

This remaining $^{22}$Ne persists in low mass stellar models that evolve to become C/O white dwarfs, and is potentially detectible in their pulsation periods, see [Chidester et al. 2021](https://ui.adsabs.harvard.edu/abs/2021ApJ...910...24C/abstract). 
 
In massive stellar models, $^{22}$Ne provides the neutron excess necessary for a variety of s-process reactions, and directly influences the budget of neutrons available for weak nuclear reactions during advanced burning, see [Farag et al. 2024](https://ui.adsabs.harvard.edu/abs/2024ApJS..273..28F/abstract).

The results in the exell document should look something like this
![core_mass](Figures/Core_mass.png)
![co_fraction](Figures/c_o_fraction.png)

Below are profiles of the same stellar model at core-Helium depletion, with differing $^{12}$C$(\alpha,\gamma)^{16}$O rates
![c12ag_profile](Figures/c12_o16_profile.png)
</details>

It is important to highlight that while the CO and He core masses are not substantially different, the mass fraction of Carbon available for carbon burning is substantially altered, and this could have larger consequences for the manner in which Carbon ignites in these massive stellar cores. It has long been thought that the nature in which Carbon ignites, radiative versus convectively, is coupled intimately with the resulting presupernova structure of stellars models, and ultimately whether they will collapse into a neutron star or black hole. See [Timmes et al.](https://ui.adsabs.harvard.edu/abs/1996ApJ...457..834T/abstract),
[Sukhbold & Woosley 2014](https://ui.adsabs.harvard.edu/abs/2014ApJ...783...10S/abstract),
[Sukhbold et al. 2018](https://ui.adsabs.harvard.edu/abs/2018ApJ...860...93S/abstract),
[Sukhbold & Adams 2020](https://ui.adsabs.harvard.edu/abs/2020MNRAS.492.2578S/abstract).


In lower mass models which form C/O white dwarfs, the change in composition resulting from uncertainties in the c12ag nuclear reaction rate can be constrained through asteroseismology of gravity modes in white dwarfs. See [Chidester et al. 2022](https://ui.adsabs.harvard.edu/abs/2022ApJ...935...21C/abstract)
[Chidester et al. 2023](https://ui.adsabs.harvard.edu/abs/2023ApJ...954...51C/abstract). 


## Connecting to Population synthesis models

Many population-synthesis calculations do not evolve full stellar structure for every stellar model. Instead, they map pre-collapse core properties (typical at core-C depletion) to compact-remnant masses using analytic prescriptions. Here we connect our MESA models to the smooth remnant-mass prescription in [Fryer et al. 2022](https://ui.adsabs.harvard.edu/abs/2022ApJ...931...94F/abstract), which is also used in population-synthesis studies such as [Olejak et al. 2022](https://ui.adsabs.harvard.edu/abs/2022MNRAS.516.2252O/abstract).  

Definitions:

- $M_{\mathrm{CO}}$: CO-core mass at collapse (from your MESA model),
- $f_{\mathrm{mix}}$: mixing parameter in the Fryer+2022 fit,
- $M_{\mathrm{crit}}$: critical CO-core mass scale (use $M_{\mathrm{crit}} = 5.75\,M_\odot$),
- $M_{\mathrm{collapse}}$: total mass at collapse.

Using Fryer+2022, the baryonic remnant mass is

$
M_{\mathrm{rem}}^{(\mathrm{raw})} = 1.2 + 0.05\,f_{\mathrm{mix}} + 0.01\left(\frac{M_{\mathrm{CO}}}{f_{\mathrm{mix}}}\right)^2 + \exp\\left[f_{\mathrm{mix}}(M_{\mathrm{CO}}-M_{\mathrm{crit}})\right]
$

and then

$
M_{\mathrm{rem}} = \min\\left(M_{\mathrm{rem}}^{(\mathrm{raw})},\,M_{\mathrm{collapse}}\right)
$

This is the quantity we plot below. In this lab, changing the $^{12}$C$(\alpha,\gamma)^{16}$O rate shifts the final core structure (especially $M_{\mathrm{CO}}$), which then shifts $M_{\mathrm{rem}}$. That is the direct link from reaction-rate uncertainty to compact-remnant predictions used in population synthesis.

|:clipboard: TASK|
|:--|
|For your chosen $\sigma\_{C12}$ model, extract the final values for `co_core_mass`, `he_core_mass`, `center_c12`, and `center_o16` from your MESA output.|
|Compute $M_{\mathrm{rem}}$ using the equations above for $f_{\mathrm{mix}}=0.7$ and add it to the [google spreadsheet](https://docs.google.com/spreadsheets/d/13_nOw6fDVWArYquJWmh0mro1liEgC7_uCfqQcIMxsS0/edit?usp=sharing).|
|Look at the plot of $M\_{\mathrm{rem}}$ vs. $\sigma\_{C12}$ in the [google spreadsheet](https://docs.google.com/spreadsheets/d/13_nOw6fDVWArYquJWmh0mro1liEgC7_uCfqQcIMxsS0/edit?usp=sharing).|
|Briefly discuss what this implies for NS/BH outcomes in population-synthesis models.|
|Compare the results from the spreadsheet with the plots in the Answers block below.|


|:information_source: Warning!|
|:--|
|The actual final value of $M\_{CO}$ at core-collapse can be influenced heavily by the shell mergers during Carbon or Oxygen burning, if they occur. See [Sukhbold & Woosley 2014](https://ui.adsabs.harvard.edu/abs/2014ApJ...783...10S/abstract). The central Carbon Mass fraction and the relation to he/co core mass and shell-mergers in massive stars has been studied in the appendix of [Laplace et al. 2025](https://ui.adsabs.harvard.edu/abs/2025A%26A...695A..71L/abstract). See also, https://ui.adsabs.harvard.edu/abs/2025A%26A...698A.216R/abstract on the impact of the central Carbon mass fraction on the occurrence of shell-mergers. See also the comments for the convective overshooting `&controls` in `inlist_common`.|
|$M\_{CO}$ is not a self consistent proxy for the Chandrasekar mass of the collapsing core. Instead one must actually look at the structure, and specifically the electron fraction $Y\_{e}$ of the collapsing core [Boccioli et al. 2024](https://ui.adsabs.harvard.edu/abs/2024PhRvD.110b3007B/abstract). The actual relation between $M\_{CO}$ and $M\_{ch}$ and the final remenant mass $M\_{rem}$ is more complicated than the simplified picture presented in this lab (and often assumed in population synthesis codes). Even then, accurately capturing the mapping between $M\_{CO}$, $M\_{ch}$, and $M\_{rem}$ remains an active area of research.|

<details markdown="block">
<summary>Answers: $M_{\mathrm{rem}}$ for $^{12}$C$(\alpha,\gamma)^{16}$O reaction rate</summary>
![Fryer_plot](Figures/sigma_vs_Mrem_Fryer2022.png)
![Fryer_plot](Figures/f_rem_0p7_sigma_vs_Mrem_Fryer2022.png)

</details>


|:clipboard: Bonus TASK|
|:--|
|Change the initial mass of your stellar model in the range between (15,25) M\_\odot$ and run to core-Helium depletion again.|
|For your chosen $\sigma\_{C12}$ model, extract the final values for `co_core_mass`, `he_core_mass`, `center_c12`, and `center_o16` from your MESA output.|
|Compute $M_{\mathrm{rem}}$ using the equations for $f_{\mathrm{mix}}=0.7$ and add it to the [google spreadsheet](https://docs.google.com/spreadsheets/d/13_nOw6fDVWArYquJWmh0mro1liEgC7_uCfqQcIMxsS0/edit?usp=sharing).|


|:information_source: HINT|
|:--|
|Since we have been loading in a a 15 M$\_\odot$ ZAMS model, you'll need to instead create a new model by commenting out `load_saved_model = .true.` or change it to `.false.` in the `&star_job` section of `inlist_project`|
|you'll also want to add the following line to your inlist in the `&star_job` section of `inlist_project`: `create_pre_main_sequence_model = .true.`|

