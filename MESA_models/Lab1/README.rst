.. _Massive_star_to_CC:

******************
Massive_star_to_CC
******************

This test suite evolves a 20 |MSun| model from the ZAMS to core collapse.

Physical checks
===============

None

Inlists
=======

This test case has six parts.

* Part 1 (``inlist_project``) load a 20 |Msun|, 1d-1 solar metallicity model and evolve it until core-Helium depletion,
defined as when the central Helium mass fraction decreases below 1d-6.
* Part 2 (``inlist_project``) optionally change the stopping condition and evolve the star until core-collapse.


Last-Updated: 12Feb2026 by EbF
