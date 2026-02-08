.. _Massive_star_to_CC:

******************
Massive_star_to_CC
******************

This test suite evolves a 20 |MSun| model from the pre-ms to core collapse.

Physical checks
===============

None

Inlists
=======

This test case has six parts.

* Part 1 (``inlist_make_late_pre_zams``) creates a 12 |Msun|, solar metallicity, pre-main sequence model and evolves it for 100 years.

* Part 2 (``inlist_to_zams``) evolves the model to the zero age main sequence.

* Part 6 (``inlist_to_cc``) evolves from ZAMS until core collapse.

Last-Updated: 16Dec2025 by EbF
