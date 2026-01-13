---
layout: default
title: Lab2
---

<script type="text/x-mathjax-config">MathJax.Hub.Config({tex2jax:{inlineMath:[['\$','\$'],['\\(','\\)']],processEscapes:true},CommonHTML: {matchFontHeight:false}});</script>
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"></script>

# Lab2 - Exploring the Stability of Mass Transfer

This lab will continue using the downloaded `Lab1_binary` directory from Lab1 where we are modeling our system as a star + point mass. Let's copy over the directory with a new name or redownload it from here: [Lab1_binary](https://drive.google.com/file/d/1p7A4C0r1Be3CPxPLLIVNXZTVtVWccvze/view?usp=share_link),but make sure pgbinary_flag is set to true in inlist_project as we did in the introduction.
```shell-session
$ cp -r Lab1_binary Lab2_binary
```
In `inlist_project` and make sure you are running in single star mode: `evolve_both_stars = .false.`.


A complete solution to this lab can be found here: [Lab2_solution](https://drive.google.com/file/d/1mFaP6gWuC8VGxtTqoTg7lh6BCTkNYVzc/view?usp=share_link)

### Science goal

The goal of this lab is to explore how binaries evolve depending on the companion mass and mass ratios $q\equiv M_2/M_1$. The aim is to see the diversity of stellar evolution when the star is in a binary. This lab will focus on identifying when mass transfer is stable or unstable in low and high mass ratio binary systems. This lab closely follows the [2022 MESA Summer School Maxilab provided by Pablo Marchant](https://orlox.github.io/mesa2022_hmxb/).

### Bonus goal

Our bonus goal is to explore the impact of adopting a nonconservative mass transfer prescription on mass transfer stability.


## When is mass transfer stable versus unstable?

Mass transfer in binary systems is often classified as stable or unstable. There is no universal definition for the stability, but it is often understood as follows.

Stable Mass transfer: When mass transfer proceeds in a controlled manner, without leading to dramatic changes in the system. The donor star loses mass at a rate that allows the binary system to remain bound and evolve over time. Typically, this results in a smooth and gradual transfer of mass.

Unstable Mass Transfer: This occurs when the mass transfer process leads to rapid and uncontrollable changes in the system. The donor star loses mass at a rate that destabilizes the system, typically considered to lead to a common envelope phase, where the envelope of the donor star engulfs both stars, or even to the merger of the two stars. This usually results in dramatic, often short-lived, evolutionary changes in the binary system. 

Mass transfer rates can reach values as high as a solar mass per year. "Due to the limitations within MESA, as a code which models the donor star as a 1-dimensional object. For extreme mass ratios, the shrinkage of the orbit as mass transfer proceeds becomes extreme enough that the star cannot adjust itself through mass loss to avoid extreme overflow. In such a case the donor would very likely engulf its companion, initiating a process of common-envelope evolution which is fundamentally 3-dimensional. MESA being a 1-dimensional code cannot deal with such a situation, but rather tries to keep modeling this evolutionary phase as a stable mass transfer event with an ever increasing mass transfer rate, which eventually leads to numerical problems." (MESA Summer school 2022)

Rather than attempting to approximate a common-envelope phase with MESA, we will simply construct a physical criterion to identify when an unstable mass transfer phase could start, and terminate the evolution at that stage. For this purpose we will consider the thermal and dynamical timescales of the the donor star.

Although there are ways to approximate a common-envelope phase with MESA, here we wish to simply construct a physical criterion to identify when an unstable mass transfer phase could start, and terminate the evolution at that stage. For this purpose, we will consider the thermal and dynamical timescales of the star:

$$\tau_{\text{thermal}} = \frac{GM^2}{RL}, \quad \tau_{\text{dynamical}} = \frac{1}{\sqrt{G \langle \rho \rangle}} $$

From these, one can define characteristic mass transfer rates:

$$
\dot{M}_{\text{thermal}} = \frac{M}{\tau_{\text{thermal}}}
$$

$$ \quad \dot{M}_{\text{dynamical}} = \frac{M}{\tau_{\text{dynamical}}}
$$

As a criterion to test for unstable mass transfer, we will check at the end of each timestep if the mass transfer rate $\(\dot{M}_{\text{transfer}}\)$ exceeds significantly the thermal rate. This is indicative of the donor approaching a near-adiabatic behavior, leading to runaway overflow. In particular, we will require that 

$$
\dot{M}_{\text{transfer}} > 100 \dot{M}_{\text{thermal}}
$$

to terminate our simulation.

|:clipboard: TASK 1|
|:--|
| For stable mass transfer, Ensure the model terminates at core Helium depeletion with the stopping condition: $X(^4\mathrm{He})\leq10^{-4}$|
| For unstable mass transfer, Let's add a stopping condition which terminates the model when $$\dot{M}_{\text{transfer}} > 100 \dot{M}_{\text{thermal}}$$.|
|Implement this check in the function `extras_binary_finish_step` in `run_binary_extras.f90`.|

|:information_source: Tips|
|:--|
|Don't forget to remove the stopping conditions you set in lab1.|
|Binary point parameters can be found `$MESA_DIR/binary/public/binary_data.inc`|
|You can use the defined constant `standard_cgrav`. Compute both $$(\dot{M}_{\text{thermal}})$$ and $$(\dot{M}_{\text{dynamical}})$$ and print their values out. To convert them from cgs units to solar masses per year, you can use the constants `Msun` and `secyer`.|
|The mass transfer rate is contained in `b%mtransfer_rate`. Bear in mind that it is defined as negative.|
|Setting `extras_binary_finish_step = terminate` within the subroutine will terminate your simulation.|
|Whenever you terminate a simulation in this way, it is ideal to print a message so the run does not just silently stop.|



<details markdown="block">
<summary>Answers: Example stable/unstable mass transfer stopping condition</summary>

In `inlist1`, ensure the following stopping condition is set:


```plaintext
   xa_central_lower_limit_species(1) = 'he4'
   xa_central_lower_limit(1) = 1d-4
```


Then add the following in `run_binary_extras.f90`.

```fortran
integer function extras_binary_finish_step(binary_id)
   type (binary_info), pointer :: b
   integer, intent(in) :: binary_id
   integer :: ierr
   real(dp):: mdot_th, mdot_dyn, avg_rho
   call binary_ptr(binary_id, b, ierr)
   if (ierr /= 0) then ! failure in  binary_ptr
      return
   end if

  extras_binary_finish_step = keep_going
  write(*,*) "---------------------"

 ! check for unstable mass transfer
 mdot_th = b% m(1)/(standard_cgrav*b% m(1)**2/(b% s1% L(1)*b% r(1)))
 avg_rho = b% m(1)/(4d0*pi/3d0*(b% r(1))**3)
 mdot_dyn = b% m(1)/(1/sqrt(standard_cgrav*avg_rho))

 write(*,*) "check: mdot_therm, mdot_dyn", mdot_th/Msun*secyer, mdot_dyn/Msun*secyer
 write(*,*) "abs(mtransfer_rate)/mdot_th", abs(b% mtransfer_rate)/mdot_th
 if (abs(b% mtransfer_rate)>100d0*mdot_th) then
     write(*,*) "Finish simulation due to high mass transfer rate"
     extras_binary_finish_step = terminate
 end if

end function extras_binary_finish_step
      
```


</details>

We will need additional information at the end of a run, as well as an additional termination condition. While exploring a grid with multiple physical variations, one thing that can happen is that the binary is too wide to undergo Roche-lobe overflow. So we want our run to report the maximum amount of Roche lobe overflow $(R/R_{\text{Rl}})$ when it terminates. 

|:clipboard: TASK 2|
|:--|
|In `extras_binary_finish_step` calculate the total time spent in Roche Lobe overflow at each time step by checking when `b% r(1) > b% rl(1)` and adding the current time step (`b% time_step`) to `b% xtra(1)`. By default, `b% xtra(1)` is initiated at zero.|
|In `extras_binary_finish_step` store the value of $\(R/R_{\text{Rl}}\)$ in `b% xtra(2)` if it exceeds the value of `b% xtra(2)`. By default, `b% xtra(2)` is initiated at zero, so in this way, you will keep its maximum value.|
|In `extras_binary_after_evolve` include a `write(*,*) "Check maximum R/R_Rl", b% xtra(2)` line to output the maximum value achieved. The `extras_binary_after_evolve` subroutine is called once the simulation finishes.|


<details markdown="block">
<summary>Answers: How to store time spent in RL overflow and max $(R/R_{\text{Rl}})$ condition</summary>
   
The implementation below also includes the the time spent in Roche lobe overflow and the stopping condition we implemented in the previous task.

In `extras_binary_finish_step`:
```fortran   
integer function extras_binary_finish_step(binary_id)
   type (binary_info), pointer :: b
   integer, intent(in) :: binary_id
   integer :: ierr
   real(dp):: mdot_th, mdot_dyn, avg_rho
   call binary_ptr(binary_id, b, ierr)
   if (ierr /= 0) then ! failure in  binary_ptr
      return
   end if

  extras_binary_finish_step = keep_going
  write(*,*) "---------------------"
  ! calculate time in yrs spent in rl overflow
  if (b% r(1) > b% rl(1)) then
  b% xtra(1) = b% xtra(1)+b% time_step
  end if
  write(*,*) "time spent in rl_overflow", b% xtra(1)

  ! calculate the max value of R/RL
  b% xtra(2) = max(b% r(1)/b% rl(1), b% xtra(2))

 ! check for unstable mass transfer
 mdot_th = b% m(1)/(standard_cgrav*(b% m(1))**2/(b% s1% L(1)*b% r(1)))
 avg_rho = b% m(1)/(4d0*pi/3d0*(b% r(1))**3)
 mdot_dyn = b% m(1)/(1/sqrt(standard_cgrav*avg_rho))

 write(*,*) "Check maximum R/R_Rl", b% xtra(2)
 write(*,*) "check: mdot_therm, mdot_dyn", mdot_th/Msun*secyer, mdot_dyn/Msun*secyer
 write(*,*) "abs(mtransfer_rate)/mdot_th", abs(b% mtransfer_rate)/mdot_th
 if (abs(b% mtransfer_rate)>100d0*mdot_th) then
     write(*,*) "Finish simulation due to high mass transfer rate"
     extras_binary_finish_step = terminate
 end if
end function extras_binary_finish_step
```

In `extras_binary_after_evolve`:
```fortran   
subroutine extras_binary_after_evolve(binary_id, ierr)
      type (binary_info), pointer :: b
      integer, intent(in) :: binary_id
      integer, intent(out) :: ierr
      call binary_ptr(binary_id, b, ierr)
      if (ierr /= 0) then ! failure in  binary_ptr
         return
      end if

     write(*,*) "Check maximum R/R_Rl", b% xtra(2)

   end subroutine extras_binary_after_evolve     
```
</details>



The other thing we will need to add is a check on overflow. The Kolb scheme allows stars to overflow, with larger mass transfer rates happening at larger overflow. But if the radius of the star exceeds the orbital separation, there's definitely something fishy happening! 

|:clipboard: TASK 3|
|:--|
|Add another termination condition that checks if the radius of the star exceeds the binary separation (use `b%r(1)` and `b% separation`).| 

|:information_source: Tips|
|:--|
|Remember this can be added in `extras_binary_finish_step`. Be sure to add a `write(*,*)` statement saying why the run finished!|

<details markdown="block">
<summary>Answers: Add stopping condition for when radius exceeds separation </summary>
   
In `extras_binary_finish_step`, add :
```fortran   
       if (b% r(1) > b% separation) then
           write(*,*) "Finish simulation due to radius exceeding separation"
           extras_binary_finish_step = terminate
       end if
```

`extras_binary_finish_step` should now look something like this:
```fortran   
    integer function extras_binary_finish_step(binary_id)
         type (binary_info), pointer :: b
         integer, intent(in) :: binary_id
         integer :: ierr
         real(dp):: mdot_th, mdot_dyn, avg_rho
         call binary_ptr(binary_id, b, ierr)
         if (ierr /= 0) then ! failure in  binary_ptr
            return
         end if

        extras_binary_finish_step = keep_going
        write(*,*) "---------------------"
        ! calculate time in yrs spent in rl overflow
        if (b% r(1) > b% rl(1)) then
        b% xtra(1) = b% xtra(1)+b% time_step
        end if
        write(*,*) "time spent in rl_overflow", b% xtra(1)

        ! calculate the max value of R/RL
        b% xtra(2) = max(b% r(1)/b% rl(1), b% xtra(2))

       ! check for unstable mass transfer
       mdot_th = b% m(1)/(standard_cgrav*(b% m(1))**2/(b% s1% L(1)*b% r(1)))
       avg_rho = b% m(1)/(4d0*pi/3d0*(b% r(1))**3)
       mdot_dyn = b% m(1)/(1/sqrt(standard_cgrav*avg_rho))

       write(*,*) "Check maximum R/R_Rl", b% xtra(2)
       write(*,*) "check: mdot_therm, mdot_dyn", mdot_th/Msun*secyer, mdot_dyn/Msun*secyer
       write(*,*) "abs(mtransfer_rate)/mdot_th", abs(b% mtransfer_rate)/mdot_th
       if (abs(b% mtransfer_rate)>100d0*mdot_th) then
           write(*,*) "Finish simulation due to high mass transfer rate"
           extras_binary_finish_step = terminate
       end if

       if (b% r(1) > b% separation) then
           write(*,*) "Finish simulation due to radius exceeding separation"
           extras_binary_finish_step = terminate
       end if

      end function extras_binary_finish_step
```

Make sure to compile before running.

```shell-session
$ ./mk
$ ./rn
```

</details>



After making these changes we want to run our model to see if it triggers the condition. Also, we want to see how the thermal timescale compares to the dynamical one.


|:information_source: CATCH UP|
|:--|
| If you are having difficulty completing any of the previous portions of the lab, you can download the complete solution [`run_binary_extras.f90`](https://drive.google.com/file/d/12bZd-B_WbnHYi29LrjEdjXNAqKfNrfde/view?usp=share_link) and paste it into your `./src` directory.|

Having physical termination conditions to capture regions where MESA cannot properly model an evolutionary phase can be very valuable. It helps avoid the production of spurious results, and also avoids simulations from getting stuck into situations where timesteps become extremely small and simulations could in principle run for years without completing. This can be a big issue when running a large number of simulations in a cluster, potentially leading to a significant waste of resources. 

Before running the model, adopt the following `&binary_controls` in `inlist_project`:

```
   m1 = 15d0  ! donor mass in Msun
   m2 = 6d0 ! companion mass in Msun
   initial_period_in_days = 2d0
```

Now, we will run the model to test our termination condition. As before, for this, we need to execute the below commands in the terminal

```shell-session
$ ./clean
$ ./mk
$ ./rn
```

Your model should terminate roughly around model number 108 and return the following stopping condition

```shell-session
---------------------
 time spent in rl_overflow   53519.224932096622     
 Check maximum R/R_Rl   1.0412387352806036     
 check: mdot_therm, mdot_dyn   1.2608621574877103E-005   28723.606276916689     
 abs(mtransfer_rate)/mdot_th   113.10883055244405     
 Finish simulation due to high mass transfer rate
```


<!--
### Approximating the final state of the Binary

So if mass transfer can proceed stably for extreme mass ratios, we could potentially get an extreme reduction in orbital separation! This is particularly interesting in the context of gravitational wave sources (van den Heuvel et al. (2017)), where the time for two point masses to merge depends strongly on the orbital separation. For a circular orbit, the merger time is (Peters, P. C. (1964)):

$$
t_{\text{merger}} = \frac{a^4}{4B}, \quad B \equiv \frac{64G^3}{5c^5} \frac{(M_1 + M_2)}{M_1 M_2}
$$

Taking arbitrarily high initial mass ratios could, in principle, lead to arbitrarily small post mass-transfer separations, but there is a competition with mass transfer stability, which we have studied in the previous lab. The purpose of this lab is to study whether or not at the boundary for stability the mass ratio is extreme enough to provide the required shrinkage in orbital separation for gravitational waves to take over. We will consider a \(30M_{\odot}\) donor star with different masses for a black hole companion and compute a grid of simulations using all the cores at disposition from the attending crowd. Throughout the lab, we will make use of `mdot_scheme='Kolb'`.


Now, rather than modeling the system all the way to helium depletion, we will make some big assumptions for its final state of the system. This will allow us to only model a fraction of its evolution, which is useful to explore a large input parameter space.

We will assume that after the donor stripped down to its helium core mass t\(20M_{\odot}\), mass transfer will proceed successfully until the star is stripped down to its helium core.

The final separation after mass transfer will be computed using Equation (1).

We will assume that after stripping, mass loss is negligible, and the star will form a black hole with no mass loss at all (direct collapse while ignoring any neutrino losses). This means we also take the separation after mass transfer to be the separation when the binary black hole forms. Using that information, we will compute the merger time with Equation (2).

To include a termination condition based on reaching a minimum mass limit, you can use `star_mass_min_limit = 20d0` in the controls section of `inlist1`.

The information on the helium core mass is stored in the `star_info` variable `he_core_mass`. In `run_binary_extras` you can access it with `b%s1%he_core_mass`. Beware that this is not in grams but in \(M_{\odot}\) units! Now, we are not interested in you spending too much time just typing equations, so we provide you here the solution right away. The following is the final version of `extras_binary_after_evolve`, be sure to check it and understand what it is doing (it includes the reporting of maximum overflow implemented previously).


<details markdown="block">
<summary>Answers: Add stopping condition for when radius exceeds separation </summary>
   

```fortran   
subroutine extras_binary_after_evolve(binary_id, ierr)
   type (binary_info), pointer :: b
   integer, intent(in) :: binary_id
   integer, intent(out) :: ierr
   real(dp) :: m1f, m2f, qi, qf, ai, af, Bmerge, tmerge
   call binary_ptr(binary_id, b, ierr)
   if (ierr /= 0) then ! failure in  binary_ptr
      return
   end if

  ! check merger time
  qi = b% m(1)/b% m(2)

  m1f = b% s1% he_core_mass*Msun ! assume stripping down to the helium core
  m2f = b% m(2) ! assume no further accretion
  qf = (b% s1% he_core_mass*Msun)/b% m(2)

  ai = b% separation
  af = ai*(qi/qf)**2*((1+qi)/(1+qf))*exp(2*(qf-qi))

  Bmerge = 64d0/5d0*standard_cgrav**3/clight**5*(m1f+m2f)*m1f*m2f
  tmerge = af**4/(4d0*Bmerge)

  write(*,*) "Merger time in Gigayears", tmerge/secyer/1e9
  write(*,*) "Check maximum R/R_Rl", b% xtra(2)

end subroutine extras_binary_after_evolve     
```
</details>

-->



|:information_source: CATCH UP|
|:--|
| If you are having difficulty completing any of the previous portions of the lab, you can download the complete solution [`run_binary_extras.f90`](https://drive.google.com/file/d/12bZd-B_WbnHYi29LrjEdjXNAqKfNrfde/view?usp=share_link) and paste it into your './src' directory.|

## Exploring a grid of mass transfer models with varying mass ratios
To explore the stability of mass transfer across various mass ratios and orbital periods. Let's start by assuming fully conservative mass transfer, i.e. (`mass_transfer_beta = 0.0d0`).

For this lab we will keep the Primary/donor mass fixed at **`m1 = 15d0`**, do not adjust this mass. We will explore the binary evolution of our system with varying periods and mass ratios `m2/m1` by modifying `initial_period_in_days` and `m2`. We will explore the following mass range $M_{2} = 1 M_{\odot} - 14 M_{\odot}$ and periods $P_\mathrm{orb} = 2$ days - 4096 days. We've discretized this parameter space in the following two tables:

| Companion (accretor) Mass ( $M_{\odot}$ ) |   
|:------------------------|
| 1      |
| 2        |
| 3        |
| 4        |
| 5        |
| 6      |
| 7        |
| 8        |
| 9        |
| 10        |
| 11        |
| 12        |
| 13        |
| 14        |
| 15        |

| Period (days) |     
|:--------------|
| 2        | 
| 4        | 
| 8        | 
| 16        |
| 32       |
| 64       |
| 128       |
| 256       |
| 512       |
| 1024       |
| 2048       |
| 4096       |


|:clipboard: TASK 4|
|:--|
|In the [Day 4 Massive Binaries Lab2, Google sheets](https://docs.google.com/spreadsheets/d/1__UPg_5JfiBkJpZTleyaSwW_faxHzmo_X7Us2RTfLOM/edit?gid=186649668#gid=186649668), choose a period and companion mass and type your initials on the corresponding block. With `inlist_project` open, fill in your chosen values of Primary Mass and Period from the spread sheet.| 
|run your model, `./rn`|  
|When your model is finished running, fill in your block in the spreadsheet with the appropriate colors for Stable versus unstable and mass transfer type.|


The model should take less than 10 minutes to run on a 4 core machine, you can use this time to inspect and discuss differences between your models and those of the others at your table. 

| :question: Below are some questions to discuss at your table and answer while your model evolves | 
| :--- |
| 1. What type of mass transfer does your system undergo? Case A, B, C? |
| 2. Is the mass transfer in your system stable or unstable?|
| 3. What is the approximate mass of the primary when the mass transfer phase ends?|
| 4. What is the approximate mass of the secondary (accretor) when the mass transfer phase ends?|

|:information_source: Tips|
|:--|
|To help in analyzing your model, you can try to make a movie of your `&pgbinary` diagram so you can watch the movie instead of re-running your MESA model. In your `Lab1_binary` directory you can execute the `images_to_movie` command to convert your saved `&pgbinary` pngs into a movie. Here is an example that produces a .mp4 movie named `movie.mp4`.|
|`$ images_to_movie "png/*.png" movie.mp4`|

<dl>
  <dt> Case A mass transfer </dt>
       <dd> Mass transfer from a core hydrogen burning star (main sequence star).</dd>
  <dt> Case B mass transfer </dt>
       <dd> Mass transfer from a core hydrogen depleted star (post-main sequence star).  </dd>
  <dt> Case C mass transfer </dt>
       <dd> Mass transfer from a core helium depleted star. </dd>
</dl>

<!--
Now that you have created a wonderful `&pgbinary` movie, you can use this movie in conjuction with our terminal output from our run to answer the following questions!

|:information_source: CATCH UP|
|:--|
| If you are having issues generating a pgstar movie, we have provided precomputed `&pgbinary` movies for all the runs [available for download here](https://drive.google.com/drive/folders/1yubo5s121aMKaxUs690oLAcAwxqOcm52?usp=share_link).|
-->



|:question: DISCUSSION|
|:--|
| 1. What are the qualitative differences between Case A vs B mass transfer? |
| 2. How does the mass ratio influence the stability of mass transfer and their outcome? |
| 3. We have ignored the effect of winds here. How do you think the evolution would change if we added winds on top of binary effects? |

If you have arrived here, you can pick another Mass and Period from the table or move on to Bonus 1!

<!-- ## Bonus1 : Evolving to Core-Carbon Depletion

Let's try extending our stopping condition to when the primary reaches core-Carbon depletion, and look for a second mass transfer phase. Then fill in the last column in the [Day 4 Massive Binaries Lab3 tab in Google sheets](https://docs.google.com/spreadsheets/d/1__UPg_5JfiBkJpZTleyaSwW_faxHzmo_X7Us2RTfLOM/edit?usp=sharing) .

| :question: Below are some questions to discuss at your table and answer while your model evolves | 
| :--- |
| 1. Does your system undergo a second mass transfer phase?|
| 2. Is your primary a BSG, YSG, or RSG when it reaches core-Carbon depletion?|
| 3. What type of observation supernova will your primary result in?|
| 4. Is the mass transfer in your system stable or unstable?|

-->
## Bonus 1: Nonconservative Mass Transfer

As in Lab1, try adopting the following nonconservative Mass transfer controls and re-run your model, then navigate to the [Bonus 1 tab in the Day 4 Massive Binaries Lab2 tab in Google sheets](https://docs.google.com/spreadsheets/d/1__UPg_5JfiBkJpZTleyaSwW_faxHzmo_X7Us2RTfLOM/edit?usp=sharing).

| $\alpha$ | $\beta$ | $\delta$ | $\gamma$ |
|:-----|:--------------|:--------------|:----------------|
| 0 | 0.5 | 0 | 0 |


|:question: DISCUSSION|
|:--|
|Do your answers to any of the aforementioned questions change? Discuss with your group|

