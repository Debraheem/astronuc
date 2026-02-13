---
layout: default
title: Introduction
nav_order: 1
---
![](Figures/star_image.png)

credit: [Chiavassa et al. 2022](https://ui.adsabs.harvard.edu/abs/2022A%26A...661L...1C/abstract)

# Introduction

<!-- [HELP LINK for website building](./help.html) -->

[Google drive link to download Lab materials Materials](https://drive.google.com/drive/folders/1yFy2I7kBh6UZPYmhFxkZswQVPI0Qavjc?usp=share_link)

[Link to Lab Solutions](https://drive.google.com/drive/folders/11WEpwn17_XuxKugH0B57OHMjby-jomUj?usp=share_link)

## Goal of this Session

This session will cover basic usage of the MESA software instrument in the context of nuclear astrophysics. The session will focus on demonstrating how a user can setup a MESA stellar model, alter specific nuclear reaction rates, evolve the stellar model, and interpret the results in the context of stellar evolutionary theory and observational constraints.

## Setting up a MESA Stellar Model

To begin, please download a copy of the desired [Lab1](https://drive.google.com/file/d/1p7A4C0r1Be3CPxPLLIVNXZTVtVWccvze/view?usp=share_link) MESA work directory.
This work directory is a slightly modified version of the `$MESA_DIR/star/test_suite/20M_pre_ms_to_cc` test_suite.

Once downloaded, you can decompress the file by
```shell-session
$ unzip Lab1.zip
```

To get an idea of what is inside `Lab1` we can use the `tree` command.

The `tree` command shows the files contained in the `Lab1_binary` directory and its subdirectories.

If your terminal does not have `tree` installed, you  can do it by executing

```shell-session
$ brew install tree # on mac
```
or
```shell-session
$ sudo apt-get install tree # on linux
```
It's alright if you don't have `tree` or cannot download it, `ls` should suffice.

`tree ./Lab1` should return the following.

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

## Setting the stellar parameters

### Binary parameters

The primary file you will be modifying is `inlist_to_cc` - which is relevant for binary parameters -  will look something like this

```plaintext
&binary_job

   inlist_names(1) = 'inlist1' 
   inlist_names(2) = 'inlist2'

   evolve_both_stars = .false.

   ! save_model_when_terminate = .true.
   ! save_model_filename = 'TAMS_model.dat'

   pgbinary_flag = .true.

/ ! end of binary_job namelist

&binary_controls
   

   m1 = 15d0  ! donor mass in Msun
   m2 = 12d0 ! companion mass in Msun
   initial_period_in_days = 6d0

   ! Mass transfer efficiency controls
!   defaults are 0
!   mass_transfer_alpha = 0d0      ! fraction of mass lost from the vicinity of donor as fast wind
!   mass_transfer_beta = 0.6d0     ! fraction of mass lost from the vicinity of accretor as fast wind
!   mass_transfer_delta = 0.1d0    ! fraction of mass lost from circumbinary coplanar toroid
!   mass_transfer_gamma = 1.2d0    ! radius of the circumbinary coplanar toroid is ``gamma**2 * orbital_separation``

   limit_retention_by_mdot_edd = .false. ! for evolution with a compact object

   ! Mass transfer scheme
   mdot_scheme = "Kolb" ! default is 'Ritter'

   ! relax timestep controls
   fr = 0.2 !0.05        ! change of relative Roche lobe gap (default 0.01)
   fr_dt_limit = 5d2     ! Mimumum timestep limit allowed for fr in years
   fj = 0.05             ! change of orbital angular momentum
   fm = 0.05   ! default 0.01, envelope mass
   fdm = 0.05  ! default 0.005, fractional mass change of either star
   fa = 0.05   ! default 0.01, binary separation
   fdm_hard = 0.1
   fr_limit = 1d-3

   ! Magentic braking
   do_jdot_mb = .false.


   min_mdot_for_implicit = 1d-7
   implicit_scheme_tolerance = 1d-1
   max_tries_to_achieve = 50
   report_rlo_solver_progress = .false.



   ! Allow for evolution even when accretor overflows
   ! terminate evolution if (r-rl)/rl is bigger than this for accretor
   accretor_overflow_terminate = 1d3 


! output frequency section:
       photo_interval         = 50
       photo_digits           = 6
       history_interval       = 1
       terminal_interval      = 10
       write_header_frequency = 10

         
/ ! end of binary_controls namelist
```

and will allow us to set the binary parameters, e.g., the initial mass of the stars and their orbital period. The full list of available parameters for `&binary_job` can be found in the directory

```
$MESA_DIR/binary/defaults/binary_job.defaults
```

and those of `&binary_controls` can be found in

```
$MESA_DIR/binary/defaults/binary_controls.defaults
```

If you would like to change any of these default values, just copy them to `inlist_project` and set the new values there.

### Parameters of the component stars

Any (non-default) values for the parameters of the individual stars will be set in the `inlist1` (for primary star) and `inlist2` (for secondary star) files. The more massive star is considered as the primary star and dictates the initial evolution of the binary system. An example of the contents in `inlist1` is

```plaintext
&star_job
      show_log_description_at_start = .false.


! local directories data
      mesa_dir =''
      eosDT_cache_dir      = './eosDT_cache'
      kap_cache_dir        = './kap_cache'
      rate_tables_dir      = './rate_tables' ! For reading external rates from a local directory.
      rates_cache_dir      = './rates_cache'

! messages and info
      echo_at_start = 'MESA model has begun running'
      echo_at_end   = 'MESA model has finished running'
      show_retry_counts_when_terminate = .true.
      show_timestep_limit_counts_when_terminate = .true.

      ! turn on hydrodynamics
      change_v_flag = .true.
      new_v_flag = .true.

      show_retry_counts_when_terminate = .true.
      show_timestep_limit_counts_when_terminate = .true.

      ! pgstar is recommended for diagnosing issues and understanding the evolution
      pgstar_flag = .true.
      save_pgstar_files_when_terminate = .true.

/ ! end of star_job namelist

&eos
      use_Skye = .true.
      use_PC = .false.
      mass_fraction_limit_for_Skye = 1d-16 ! necessary for fully coupled runs. 

/ ! end of eos namelist

&kap
      ! OPAL asplund 2009 opacities, Zbase set in inlist_mass_Z_wind_rotation
      kap_file_prefix = 'a09'    ! 'gs98' 'a09' 'OP_a09' 'OP_gs98'
      kap_CO_prefix   = 'a09_co' ! 'gs98_co' 'a09_co'
      kap_lowT_prefix = 'lowT_fa05_a09p'
      use_Type2_opacities = .true.

/ ! end of kap namelist

&controls

! wind
      ! Dutch scaling factor set in inlist_mass_Z_wind_rotation
      cool_wind_full_on_T = 0.8d4
      hot_wind_full_on_T = 1.2d4
      cool_wind_RGB_scheme = 'Dutch'
      cool_wind_AGB_scheme = 'Dutch'
      hot_wind_scheme = 'Dutch'
      Dutch_wind_lowT_scheme = 'de Jager'
      max_T_center_for_any_mass_loss = 1.1d9

! atmosphere
      Pextra_factor = 2 

! mlt
      mixing_length_alpha = 2d0
      MLT_option = 'TDC'

      use_Ledoux_criterion = .true.
      semiconvection_option = 'Langer_85 mixing; gradT = gradr'
      alpha_semiconvection = 1d0
      thermohaline_option = 'Kippenhahn'
      thermohaline_coeff = 0

      num_cells_for_smooth_gradL_composition_term = 0 ! 3 is default
      num_cells_for_smooth_brunt_B = 2 ! is default 
      mlt_make_surface_no_mixing = .true.

! superadiabatic convection routines
      ! MLT ++, explicit, well tested
      okay_to_reduce_gradT_excess = .false.
      gradT_excess_f1 = 1d-4
      gradT_excess_f2 = 1d-2
      !gradT_excess_lambda1 = -1d0 ! full on

! overshooting
  ! we use step overshooting in H core
      overshoot_scheme(1) = 'step'
      overshoot_zone_type(1) = 'burn_H'
      overshoot_zone_loc(1) = 'core'
      overshoot_bdy_loc(1) = 'any'
      overshoot_f(1) = 0.345 ! for M>10
      overshoot_f0(1) = 0.01

  ! exponential in the He core
      overshoot_scheme(2) = 'exponential'
      overshoot_zone_type(2) = 'burn_He'
      overshoot_zone_loc(2) = 'core'
      overshoot_bdy_loc(2) = 'any'
      overshoot_f(2) = 0.01
      overshoot_f0(2) = 0.005

     ! we don't want to deal with He/CO core mergers
     ! and there is reason to believe there is little
     ! inward overshooting in the shell across compositions boundaries
      overshoot_scheme(3) = 'none'
      overshoot_zone_type(3) = 'burn_He'
      overshoot_zone_loc(3) = 'shell'
      overshoot_bdy_loc(3) = 'bottom'

   ! a small amount of overshooting on top of any other convective core
   ! avoid spurious numerical behavior
   ! perfect amount for degenerate flames
      overshoot_scheme(4) = 'exponential'
      overshoot_zone_type(4) = 'any'
      overshoot_zone_loc(4) = 'any'
      overshoot_bdy_loc(4) = 'any'
      overshoot_f(4) = 0.005d0
      overshoot_f0(4) = 0.001d0

! operator splitting for burning
      op_split_burn = .false.
      op_split_burn_min_T = 1d9
      burn_steps_limit = 150
      burn_steps_hard_limit = 250
      op_split_burn_eps = 1d-6 !1d-5
      op_split_burn_odescal = 1d-7 !1d-5

! timesteps
      time_delta_coeff = 1.0
      varcontrol_target   = 1d-3

      min_timestep_factor = 0.8d0
      max_timestep_factor = 1.05d0
      timestep_factor_for_retries = 0.75

      limit_for_rel_error_in_energy_conservation = 1d99
      hard_limit_for_rel_error_in_energy_conservation = 1d99

      never_skip_hard_limits = .false.

      delta_lgTeff_limit =  0.01
      delta_lgL_limit = 0.1
      delta_lgL_He_limit = 0.1
      delta_lgR_limit = 1d-2
      delta_lgR_limit_min_lgR = 1d2

      ! Recommend decreasing all three Rho, T, Tmax
      ! to 1d-3 or lower in production runs
      delta_lgRho_cntr_limit = 5d-2 
      delta_lgRho_cntr_hard_limit = 0.1
      delta_lgRho_limit = 0.1

      delta_lgT_cntr_limit_only_after_near_zams = .true.
      delta_lgT_cntr_limit = 2d-3 
      delta_lgT_cntr_hard_limit = 0.1

      delta_lgT_max_limit_only_after_near_zams = .true.
      delta_lgT_max_limit = 2d-3 
      delta_lgT_max_hard_limit = 0.1

      dX_div_X_limit(2) = -1 ! for he4

      ! On the changes in total abundance of each isotope
      ! one of the most useful timestep controls, period
      dX_nuc_drop_limit = 1d-2 ! Recommend decreasing to 1d-3 or lower in a production run
      dX_nuc_drop_limit_at_high_T = 1d-2  ! default = -1 = same as dX_nuc_drop_limit
      dX_nuc_drop_min_X_limit = 1d-4 ! try decreasing to 1d-4 or 1d-5 in a production run
      dX_nuc_drop_max_A_limit = 70   ! try increasing beyond 60 in a big network run
      dX_nuc_drop_hard_limit = 1d99
      dX_nuc_drop_min_yrs_for_dt = 1d-14 

      delta_lg_XH_cntr_limit = 0.01d0
      delta_lg_XH_cntr_max   = 0.0d0
      delta_lg_XH_cntr_min   = -2.0d0
      !delta_lg_XH_cntr_hard_limit = 0.02d0

      delta_lg_XHe_cntr_limit = 0.01d0
      delta_lg_XHe_cntr_max   = 0.0d0
      delta_lg_XHe_cntr_min   = -2.0d0
      !delta_lg_XHe_cntr_hard_limit = -1!0.02d0

      delta_XSi_cntr_limit = 0.01
      delta_XSi_cntr_hard_limit = -1!0.02

      !delta_lg_XSi_cntr_limit = 0.01d0
      !delta_lg_XSi_cntr_max   = 0.0d0
      !delta_lg_XSi_cntr_min   = -2.0d0
      !delta_lg_XSi_cntr_hard_limit = -1 

      delta_Ye_highT_limit = 1d-3

      dX_limit_species(4) = 'fe54'
      dX_limit(4) = 1d-2
      dX_div_X_limit_min_X(4) = 1d-5 !1d-99
      dX_div_X_limit(4) = 2d-1 !0.9d0
      dX_decreases_only(4) = .true.

! mesh
      !max_dq= 1d-3 ! or lower
      mesh_delta_coeff = 2d0 ! try 1.0 or below in production run
      mesh_delta_coeff_for_highT = 1.5d0 ! try 1.0 or below in production run
      logT_max_for_standard_mesh_delta_coeff = 9.0
      logT_min_for_highT_mesh_delta_coeff = 9.5
      min_dq_for_xa = 1d-4 !avoid over resolving composition changes
      !min_dq_for_xa_convective = 1d-4
      !remesh_dt_limit = 1728000 ! 20 days. turn off remesh when dt smaller than this

! solver

      ! damped newton and structure only
       !scale_max_correction = 0.1d0
       !ignore_species_in_max_correction = .true. ! can be useful for large networks

      use_gold2_tolerances = .false.
      use_gold_tolerances = .true.

      solver_iters_timestep_limit = 20
      gold_solver_iters_timestep_limit = 20
      iter_for_resid_tol2 = 10

      max_abs_rel_run_E_err = 1d99
      energy_eqn_option = 'dedt'
      max_tries_for_implicit_wind = 10 ! Recommend 10 for a production run
      convergence_ignore_equL_residuals = .false.
      make_gradr_sticky_in_solver_iters = .true.

      min_timestep_limit = 1d-20 ! (seconds) ! 1d-20 if things are sticky

      ! having these wide prevents solver bailing early on a solution when abundaces > 1d7.
      min_xa_hard_limit_for_highT = -1d7
      sum_xa_hard_limit_for_highT = 1d7

      when_to_stop_rtol = 1d-3
      when_to_stop_atol = 1d-3

! output
      terminal_show_log_dt = .false.

       !max_model_number = 4000000 ! if you're serious

       photo_interval         = 1000 !1000
       photo_digits           = 8
       profile_interval       = 100
       max_num_profile_models = 400000
       history_interval       = 1
       write_header_frequency = 10
       terminal_interval      = 10

      report_solver_progress = .false. ! set true to see info about solver iterations
      report_ierr = .true. ! if true, produce terminal output when have some internal error

/
&pgstar

!pause_flag = .true.

!pgstar_interval = 1

! x-axis limits and properties
Profile_Panels3_xaxis_name = 'mass'
Profile_Panels3_xmin = 0.0
Profile_Panels3_xmax = 1.6
Profile_Panels3_xaxis_reversed = .false.

/ ! end of pgstar namelist
```

Many other (default) parameters which are not modified in the above inlist can be found in the directory

```
$MESA_DIR/star/defaults/
```

As before copy the relevant parameter you wish to change to `inlist_project` before making the change. Similarly, `inlist2` contains the parameters of star 2.

# Setting values for an initial run

Here, we will run our first model. For this, we need to set the masses of the stars in the binary and the binary's orbit period. Choose a desired value and then execute the below commands in your terminal

```shell-session
$ ./mk
$ ./rn
```

### Terminal Output

On executing the above commands, MESA will print the model output on the terminal. After each step the new updated values of the binaries parameters would be printed to the display. An example output is shown below.

![An example of the output printed on the terminal](Figures/image.png)

### Pgstar Output

A picture is worth a thousand words! Rather than reading the output from the terminal, at times, an intuitive understanding of stellar evolution can be grasped from a diagram. The `Pgstar` module does exactly that. It plots the model output in real-time - depending on the chosen step size.

The `pgbinary` plots are switched on via the following flag in `&binary_job` in the file `inlist_project`.

```
   pgbinary_flag = .true.
```
We also want to try running this model in single star mode, so we have set `evolve_both_stars = .false.` as well.

This model directory "should" return a nice pgbinary plot showing the evolution of the primary with the secondary treated as a point mass. The main panel on the left for the primary should display a variety of plots for that star, while the second panel for the secondary does not appear as it is not being modeled here. An orbital seperation diagram should appear in the top right corner followed by other plots of the orbital evolution of both stars.

![pgstar](Figures/grid1_000080.png)

Now let's try to reproduce a similar pgbinary plot. We can `./mk` and `./rn` our binary directory to watch the evolution of a 15Msun star orbiting a point mass. Run your model and take note of what happens to your model and/or the models of the others at your table. Only run your model for a several tens of timesteps to see what happens. 

Discuss what happened with the the others at your table. Take note of what kind of computer are each of you using.
