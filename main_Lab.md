---
layout: default
title: "2. Changing Nuclear Reaction Rates"
nav_order: 3
---

<script type="text/x-mathjax-config">MathJax.Hub.Config({tex2jax:{inlineMath:[['\$','\$'],['\\(','\\)']],processEscapes:true},CommonHTML: {matchFontHeight:false}});</script>
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"></script>

![](Figures/star_image.png)

credit: [Chiavassa et al. 2022](https://ui.adsabs.harvard.edu/abs/2022A%26A...661L...1C/abstract)

In this section, we will graduate from using our `Intro_MESA_model` model directory, and instead use the provided work directory.  [Changing_rates](https://drive.google.com/file/d/19_R2QITiDjMbPmCc-rnObhKKcITtbohT/view?usp=sharing) MESA work directory, but make sure `pgbinary_flag` is set to true in `inlist_project` as we did in the introduction.


# 2. Changing Nuclear Reaction Rates

## Science goal

In this lab, we will focus on the evolution of a 20 M$\_{\odot}$ stellar model from the zero age main-sequence through to core-Helium depletion. We will explore which nuclear reaction rates MESA uses, how to change the rates MESA reads in, and finally we explore the impact of changing the $^{12}$C$(\alpha,\gamma)^{16}$O helium burning reaction rate, and its effect on the core properties of stellar model at core-Helium depletion. These properties are extremely important as the Carbon/Oxygen core mass, M$\_{CO}$, is often used in population synthesis calculations as an input into expressions for determining if the stellar model will form a neutron star to a black hole, and the corresponding remenant mass after the model undergoes core-collapse. See [Fryer et al. 2012](https://ui.adsabs.harvard.edu/abs/2012ApJ...749...91F/abstract), and [Fryer et al. 2022](https://ui.adsabs.harvard.edu/abs/2022ApJ...931...94F/abstract)
<!---->
<!--### Bonus goal-->
<!---->
<!--If you'd like to prepare for Lab3, you can start running a simulation with both stars and leave it running over lunch.-->


## Evolving to Core-Helium Depletion

To begin, please make sure to download a copy of the desired [changing_rates](https://drive.google.com/file/d/19_R2QITiDjMbPmCc-rnObhKKcITtbohT/view?usp=sharing) MESA work directory.
This work directory is a slightly modified version of the `\$MESA_DIR/star/test_suite/20M_pre_ms_to_cc` test_suite.

Once downloaded, you can decompress the file by
```shell-session
$ unzip changing_rates.zip
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
| `inlist_mass_Z_wind_rotation`                | The header inlist which points to all other inlists to determine which inlists are read and in what order. |
| `inlist_project`               | The main inlist which contains controls for the stellar evolution of the `m1`  |
| `inlist_common`               | The main inlist which contains controls for the stellar evolution of the `m2`     |
| `inlist_pgstar`         | The inlist which controls the pgstar output for each single star.      |
| `make/`                  | A directory containing the makefile.   |
| `mk`                    | A bash file for compiling MESA binary and Star in the model directory.      |
| `history_columns.list`  | A log file which determines which history values are saved in data files as a function of model timestep. |
| `profile_columns.list`  | A log file which determines which profiles values are saved in data files as a function of Mass/radius.     |
| `re`                    | A bash file for restarting the binary/star model executable from photos      |
| `run_lab`                    | A bash file for running the star model executable.      |
| `src/`                   | A directory containing the three files listed below.      |
| `run_star_extras.f90`   | A fortran file which can be modified to agument the stellar evolution routines.     |


`inlist_project`, `inlist_common`, and `inlist_mass_Z_wind_rotation` are the three main files that contain the microphysics information of our stellar evolution simulation.



## Helium Burning Nuclear Reactions

Nuclear Reaction rate uncertainties have a non-negliggable impact on stellar evolution models and their nucleosynthetic products.
See [Iliadis et al. 2011] (https://ui.adsabs.harvard.edu/abs/2011ApJS..193...16I/abstract),[Laird](https://ui.adsabs.harvard.edu/abs/2023JPhG...50c3002L/abstract), [Fields et al. 2018](https://ui.adsabs.harvard.edu/abs/2018ApJS..234...19F/abstract),[Farmer et al. 2019](https://ui.adsabs.harvard.edu/abs/2019ApJ...887...53F/abstract) , [Farag et al. 2022](https://ui.adsabs.harvard.edu/abs/2022ApJ...937..112F/abstract), [Pignatari et al. 2023](https://ui.adsabs.harvard.edu/abs/2023EPJA...59..302P/abstract)

For massive star evolution, four of the most uncertain rates are illustrated below (Figure from [Fields et al. 2018](https://ui.adsabs.harvard.edu/abs/2018ApJS..234...19F/abstract))


Some of the most uncertain nuclear reaction rates in nuclear astrophysics are the rates that occur during Helium burning [Deboer et al. 2017](https://ui.adsabs.harvard.edu/abs/2017RvMP...89c5007D/abstract)
![rate uncertainty](Figures/rate_uncertainty.png)


That is the triple-$\alpha$ nuclear reaction rates converting Helium into Carbon competes with the c12ag nuclear reaction rate
to set the final Carbon and Oxygen abundance in the stellar core at the end of Helium burning
![rate uncertainty](Figures/3alpha.png)
![rate uncertainty](Figures/c12ag.png)

The amount of Carbon and Oxygen in the stellar core is important as it fundamentally changes the nature of Carbon and Oxygen burning, and can have far reaching implications for the resulting presupernova stellar structure and the resulting neutron star, black hole initial mass function. 

The uncertainties in the $^{12}$C$(\alpha,\gamma)^{16}$O reaction rate are among the largest (visualized below)
![rate uncertainty](Figures/c12ag_uncertainty.png)


## Changing the $^{12}$C$(\alpha,\gamma)^{16}$O rate

MESA's nuclear reaction rates come from 


For hardcoded nuclear reaction rates, the definitions are set and called inside `$MESA_DIR/rates/private/raw_rates.f90`, with definitions for each rate contained inside `$MESA_DIR/rates/private/ratelib.f90`, or drawn from JINA Reaclib / weaklib.





|:clipboard: TASK|
|:--|
|Change the $^{12}$C$(\alpha,\gamma)^{16}$O reaction rate to one of the Deboer et al. 2017 rates shown in the figure above. Look inside your local `changing_rates/rate_tables` directory, which was copied from $MESA_DIR/rates/rates_data/rate_tables.|




![rate uncertainty](Figures/c12ag_profile.png)
![rate uncertainty](Figures/Core_mass.png)
![rate uncertainty](Figures/c_o_fraction.png)






|:clipboard: TASK|
|:--|
|Compute M$_{rem}$ follwing the relations above from Fryer et al. 2022|





![rate uncertainty](Figures/sigma_vs_Mrem_Fryer2022.png)





|:information_source: INFO |
|:--|
|If the command doesn't work, make sure to update your MESA SDK. |

When your model has finished running, try to make a movie of your `&pgstar` diagram so you can watch the movie instead of re-running your MESA model. In your `Lab1_binary` directory you can execute the `images_to_movie` command to convert your saved `&pgstar` pngs into a movie. Here is an example that produces a .mp4 movie named `movie.mp4`.

```shell-session
$ images_to_movie "png/Grid1*.png" movie.mp4
```
