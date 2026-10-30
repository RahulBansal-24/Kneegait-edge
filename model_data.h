/*
 * model_data.h — KneeGait-Edge Compact Random Forest for ESP32
 * Canonical 5 Features: [peak_swing_flexion, sagittal_rom, stance_to_swing_ratio, peak_angular_velocity, cadence_spm]
 * Classes: 0: NORMAL_GAIT, 1: MILD_FUNCTIONAL_RESTRICTION, 2: SEVERE_ANTALGIC_STIFF_GAIT
 */
#ifndef KNEEGAIT_MODEL_DATA_H
#define KNEEGAIT_MODEL_DATA_H

#include <stdint.h>
#include <math.h>

#define KNEEGAIT_NUM_FEATURES 5
#define KNEEGAIT_NUM_CLASSES  3
#define KNEEGAIT_NUM_TREES    20

// Canonical Feature Indices
#define FEAT_PEAK_SWING_FLEXION    0
#define FEAT_SAGITTAL_ROM          1
#define FEAT_STANCE_TO_SWING_RATIO 2
#define FEAT_PEAK_ANGULAR_VELOCITY 3
#define FEAT_CADENCE_SPM           4

// Fixed-Point Scale Multipliers (Q-format)
#define SCALE_PEAK_SWING_FLEXION             100
#define SCALE_SAGITTAL_ROM                   100
#define SCALE_STANCE_TO_SWING_RATIO          1000
#define SCALE_PEAK_ANGULAR_VELOCITY          10
#define SCALE_CADENCE_SPM                    10

// Floating-Point Decision Trees
static inline int _tree_0_predict(const float* f) {
    if (f[0] <= 49.380001f) {
        if (f[1] <= 39.139999f) {
            if (f[4] <= 88.950001f) {
                return 2;
            } else {
                if (f[0] <= 45.230001f) {
                    return 2;
                } else {
                    return 1;
                }
            }
        } else {
            if (f[1] <= 40.175001f) {
                if (f[4] <= 98.250000f) {
                    if (f[3] <= 131.405003f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 2;
                }
            } else {
                if (f[1] <= 40.344999f) {
                    if (f[4] <= 94.700001f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[0] <= 44.820000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_1_predict(const float* f) {
    if (f[1] <= 46.254999f) {
        if (f[0] <= 44.980000f) {
            return 2;
        } else {
            if (f[3] <= 122.320000f) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        if (f[0] <= 49.169998f) {
            return 1;
        } else {
            return 0;
        }
    }
}

static inline int _tree_2_predict(const float* f) {
    if (f[0] <= 44.995001f) {
        return 2;
    } else {
        if (f[1] <= 46.505001f) {
            if (f[0] <= 49.389999f) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_3_predict(const float* f) {
    if (f[0] <= 45.000000f) {
        return 2;
    } else {
        if (f[0] <= 49.380001f) {
            return 1;
        } else {
            return 0;
        }
    }
}

static inline int _tree_4_predict(const float* f) {
    if (f[3] <= 140.930000f) {
        if (f[0] <= 45.035000f) {
            if (f[2] <= 1.409000f) {
                return 2;
            } else {
                return 2;
            }
        } else {
            if (f[4] <= 106.450001f) {
                if (f[1] <= 48.684999f) {
                    if (f[4] <= 76.049999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        }
    } else {
        if (f[3] <= 195.110001f) {
            if (f[1] <= 46.324999f) {
                if (f[1] <= 39.139999f) {
                    return 2;
                } else {
                    if (f[1] <= 40.014999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                return 0;
            }
        } else {
            if (f[1] <= 47.279999f) {
                if (f[1] <= 37.945000f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_5_predict(const float* f) {
    if (f[0] <= 49.380001f) {
        if (f[3] <= 140.769997f) {
            if (f[1] <= 38.410000f) {
                if (f[3] <= 30.580000f) {
                    return 2;
                } else {
                    return 2;
                }
            } else {
                if (f[3] <= 126.369999f) {
                    return 2;
                } else {
                    if (f[0] <= 44.969999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[1] <= 39.565001f) {
                return 2;
            } else {
                if (f[0] <= 44.974998f) {
                    return 2;
                } else {
                    return 1;
                }
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_6_predict(const float* f) {
    if (f[1] <= 39.500000f) {
        if (f[0] <= 45.230001f) {
            return 2;
        } else {
            return 1;
        }
    } else {
        if (f[0] <= 49.380001f) {
            if (f[2] <= 1.930000f) {
                if (f[3] <= 122.634998f) {
                    return 2;
                } else {
                    if (f[0] <= 44.969999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[4] <= 96.549999f) {
                    return 1;
                } else {
                    return 2;
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_7_predict(const float* f) {
    if (f[0] <= 44.995001f) {
        return 2;
    } else {
        if (f[3] <= 195.105003f) {
            if (f[2] <= 1.588500f) {
                if (f[3] <= 178.139999f) {
                    if (f[4] <= 107.500000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[0] <= 49.420000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.646500f) {
                    if (f[3] <= 182.925003f) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[2] <= 1.746500f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[0] <= 49.375000f) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_8_predict(const float* f) {
    if (f[3] <= 141.754997f) {
        if (f[1] <= 39.710001f) {
            if (f[1] <= 38.584999f) {
                if (f[4] <= 57.250000f) {
                    return 2;
                } else {
                    return 2;
                }
            } else {
                if (f[4] <= 92.000000f) {
                    if (f[1] <= 38.605000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    return 2;
                }
            }
        } else {
            if (f[1] <= 45.205000f) {
                if (f[0] <= 44.969999f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    } else {
        if (f[0] <= 49.380001f) {
            if (f[3] <= 154.055000f) {
                if (f[0] <= 44.969999f) {
                    if (f[3] <= 141.764999f) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (f[2] <= 1.514000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[0] <= 45.010000f) {
                    return 2;
                } else {
                    return 1;
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_9_predict(const float* f) {
    if (f[0] <= 49.380001f) {
        if (f[0] <= 44.990000f) {
            return 2;
        } else {
            if (f[2] <= 1.304500f) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_10_predict(const float* f) {
    if (f[0] <= 49.389999f) {
        if (f[0] <= 44.995001f) {
            return 2;
        } else {
            if (f[1] <= 38.514999f) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_11_predict(const float* f) {
    if (f[0] <= 49.380001f) {
        if (f[0] <= 44.995001f) {
            if (f[1] <= 7.675000f) {
                return 2;
            } else {
                return 2;
            }
        } else {
            if (f[2] <= 1.321500f) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_12_predict(const float* f) {
    if (f[2] <= 1.595500f) {
        if (f[2] <= 1.512500f) {
            if (f[0] <= 49.349998f) {
                if (f[1] <= 39.295000f) {
                    return 2;
                } else {
                    if (f[1] <= 40.330000f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                return 0;
            }
        } else {
            if (f[0] <= 49.410000f) {
                if (f[1] <= 40.405001f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    } else {
        if (f[0] <= 44.995001f) {
            return 2;
        } else {
            if (f[1] <= 45.960001f) {
                if (f[1] <= 38.514999f) {
                    return 1;
                } else {
                    return 1;
                }
            } else {
                if (f[0] <= 49.084999f) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
}

static inline int _tree_13_predict(const float* f) {
    if (f[0] <= 49.380001f) {
        if (f[0] <= 44.995001f) {
            return 2;
        } else {
            if (f[1] <= 38.904999f) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_14_predict(const float* f) {
    if (f[1] <= 39.205000f) {
        if (f[3] <= 121.695000f) {
            return 2;
        } else {
            if (f[3] <= 121.704998f) {
                if (f[1] <= 33.099999f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (f[4] <= 89.049999f) {
                    if (f[0] <= 45.100000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 2;
                }
            }
        }
    } else {
        if (f[0] <= 49.380001f) {
            if (f[3] <= 120.855000f) {
                return 2;
            } else {
                if (f[0] <= 44.994999f) {
                    return 2;
                } else {
                    if (f[1] <= 39.299999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_15_predict(const float* f) {
    if (f[3] <= 141.534996f) {
        if (f[3] <= 126.920002f) {
            if (f[2] <= 1.811500f) {
                if (f[0] <= 45.240000f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (f[2] <= 1.812500f) {
                    return 2;
                } else {
                    return 2;
                }
            }
        } else {
            if (f[2] <= 1.897000f) {
                if (f[1] <= 39.880001f) {
                    if (f[0] <= 45.080000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[1] <= 45.260000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[2] <= 1.971500f) {
                    if (f[2] <= 1.970000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 2;
                }
            }
        }
    } else {
        if (f[3] <= 185.720001f) {
            if (f[0] <= 49.380001f) {
                if (f[1] <= 39.205000f) {
                    return 2;
                } else {
                    if (f[1] <= 40.004999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                return 0;
            }
        } else {
            if (f[0] <= 49.375000f) {
                if (f[0] <= 44.980000f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_16_predict(const float* f) {
    if (f[1] <= 46.254999f) {
        if (f[0] <= 44.995001f) {
            return 2;
        } else {
            if (f[1] <= 45.835001f) {
                if (f[3] <= 191.364998f) {
                    return 1;
                } else {
                    if (f[0] <= 49.385000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (f[1] <= 45.850000f) {
                    return 0;
                } else {
                    return 1;
                }
            }
        }
    } else {
        if (f[0] <= 49.160000f) {
            return 1;
        } else {
            return 0;
        }
    }
}

static inline int _tree_17_predict(const float* f) {
    if (f[3] <= 142.664993f) {
        if (f[0] <= 45.050001f) {
            return 2;
        } else {
            if (f[2] <= 1.666000f) {
                if (f[2] <= 1.646000f) {
                    if (f[1] <= 46.195000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[3] <= 137.129997f) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                return 1;
            }
        }
    } else {
        if (f[1] <= 46.984999f) {
            if (f[1] <= 39.930000f) {
                if (f[0] <= 45.824999f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (f[2] <= 1.510500f) {
                    if (f[0] <= 49.379999f) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (f[4] <= 81.149998f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_18_predict(const float* f) {
    if (f[1] <= 39.205000f) {
        if (f[0] <= 45.215000f) {
            return 2;
        } else {
            if (f[0] <= 45.565001f) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        if (f[3] <= 193.235001f) {
            if (f[2] <= 1.590500f) {
                if (f[0] <= 49.389999f) {
                    if (f[1] <= 39.334999f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            } else {
                if (f[1] <= 46.035000f) {
                    if (f[3] <= 118.350002f) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (f[0] <= 49.035000f) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (f[0] <= 49.379999f) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_19_predict(const float* f) {
    if (f[1] <= 46.385000f) {
        if (f[3] <= 142.150002f) {
            if (f[1] <= 38.584999f) {
                if (f[0] <= 45.230001f) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (f[3] <= 120.234997f) {
                    return 2;
                } else {
                    if (f[0] <= 45.010000f) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (f[2] <= 1.804500f) {
                if (f[1] <= 39.464998f) {
                    return 2;
                } else {
                    if (f[1] <= 40.014999f) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (f[1] <= 39.180000f) {
                    return 2;
                } else {
                    if (f[4] <= 101.000000f) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (f[4] <= 112.450001f) {
            return 0;
        } else {
            if (f[0] <= 49.324999f) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}

// Fixed-Point (int16_t) Decision Trees
static inline int _tree_0_predict_fixed(const int16_t* q) {
    if (q[0] <= 4938) {
        if (q[1] <= 3914) {
            if (q[4] <= 890) {
                return 2;
            } else {
                if (q[0] <= 4523) {
                    return 2;
                } else {
                    return 1;
                }
            }
        } else {
            if (q[1] <= 4018) {
                if (q[4] <= 982) {
                    if (q[3] <= 1314) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 2;
                }
            } else {
                if (q[1] <= 4034) {
                    if (q[4] <= 947) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[0] <= 4482) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_1_predict_fixed(const int16_t* q) {
    if (q[1] <= 4625) {
        if (q[0] <= 4498) {
            return 2;
        } else {
            if (q[3] <= 1223) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        if (q[0] <= 4917) {
            return 1;
        } else {
            return 0;
        }
    }
}

static inline int _tree_2_predict_fixed(const int16_t* q) {
    if (q[0] <= 4500) {
        return 2;
    } else {
        if (q[1] <= 4651) {
            if (q[0] <= 4939) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_3_predict_fixed(const int16_t* q) {
    if (q[0] <= 4500) {
        return 2;
    } else {
        if (q[0] <= 4938) {
            return 1;
        } else {
            return 0;
        }
    }
}

static inline int _tree_4_predict_fixed(const int16_t* q) {
    if (q[3] <= 1409) {
        if (q[0] <= 4503) {
            if (q[2] <= 1409) {
                return 2;
            } else {
                return 2;
            }
        } else {
            if (q[4] <= 1065) {
                if (q[1] <= 4868) {
                    if (q[4] <= 760) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        }
    } else {
        if (q[3] <= 1951) {
            if (q[1] <= 4632) {
                if (q[1] <= 3914) {
                    return 2;
                } else {
                    if (q[1] <= 4001) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                return 0;
            }
        } else {
            if (q[1] <= 4728) {
                if (q[1] <= 3794) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_5_predict_fixed(const int16_t* q) {
    if (q[0] <= 4938) {
        if (q[3] <= 1408) {
            if (q[1] <= 3841) {
                if (q[3] <= 306) {
                    return 2;
                } else {
                    return 2;
                }
            } else {
                if (q[3] <= 1264) {
                    return 2;
                } else {
                    if (q[0] <= 4497) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[1] <= 3957) {
                return 2;
            } else {
                if (q[0] <= 4497) {
                    return 2;
                } else {
                    return 1;
                }
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_6_predict_fixed(const int16_t* q) {
    if (q[1] <= 3950) {
        if (q[0] <= 4523) {
            return 2;
        } else {
            return 1;
        }
    } else {
        if (q[0] <= 4938) {
            if (q[2] <= 1930) {
                if (q[3] <= 1226) {
                    return 2;
                } else {
                    if (q[0] <= 4497) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[4] <= 965) {
                    return 1;
                } else {
                    return 2;
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_7_predict_fixed(const int16_t* q) {
    if (q[0] <= 4500) {
        return 2;
    } else {
        if (q[3] <= 1951) {
            if (q[2] <= 1589) {
                if (q[3] <= 1781) {
                    if (q[4] <= 1075) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[0] <= 4942) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1646) {
                    if (q[3] <= 1829) {
                        return 1;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[2] <= 1747) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[0] <= 4938) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_8_predict_fixed(const int16_t* q) {
    if (q[3] <= 1418) {
        if (q[1] <= 3971) {
            if (q[1] <= 3858) {
                if (q[4] <= 572) {
                    return 2;
                } else {
                    return 2;
                }
            } else {
                if (q[4] <= 920) {
                    if (q[1] <= 3860) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    return 2;
                }
            }
        } else {
            if (q[1] <= 4520) {
                if (q[0] <= 4497) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    } else {
        if (q[0] <= 4938) {
            if (q[3] <= 1541) {
                if (q[0] <= 4497) {
                    if (q[3] <= 1418) {
                        return 2;
                    } else {
                        return 2;
                    }
                } else {
                    if (q[2] <= 1514) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[0] <= 4501) {
                    return 2;
                } else {
                    return 1;
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_9_predict_fixed(const int16_t* q) {
    if (q[0] <= 4938) {
        if (q[0] <= 4499) {
            return 2;
        } else {
            if (q[2] <= 1304) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_10_predict_fixed(const int16_t* q) {
    if (q[0] <= 4939) {
        if (q[0] <= 4500) {
            return 2;
        } else {
            if (q[1] <= 3851) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_11_predict_fixed(const int16_t* q) {
    if (q[0] <= 4938) {
        if (q[0] <= 4500) {
            if (q[1] <= 767) {
                return 2;
            } else {
                return 2;
            }
        } else {
            if (q[2] <= 1322) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_12_predict_fixed(const int16_t* q) {
    if (q[2] <= 1595) {
        if (q[2] <= 1512) {
            if (q[0] <= 4935) {
                if (q[1] <= 3930) {
                    return 2;
                } else {
                    if (q[1] <= 4033) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                return 0;
            }
        } else {
            if (q[0] <= 4941) {
                if (q[1] <= 4041) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    } else {
        if (q[0] <= 4500) {
            return 2;
        } else {
            if (q[1] <= 4596) {
                if (q[1] <= 3851) {
                    return 1;
                } else {
                    return 1;
                }
            } else {
                if (q[0] <= 4908) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
}

static inline int _tree_13_predict_fixed(const int16_t* q) {
    if (q[0] <= 4938) {
        if (q[0] <= 4500) {
            return 2;
        } else {
            if (q[1] <= 3890) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        return 0;
    }
}

static inline int _tree_14_predict_fixed(const int16_t* q) {
    if (q[1] <= 3920) {
        if (q[3] <= 1217) {
            return 2;
        } else {
            if (q[3] <= 1217) {
                if (q[1] <= 3310) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (q[4] <= 890) {
                    if (q[0] <= 4510) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 2;
                }
            }
        }
    } else {
        if (q[0] <= 4938) {
            if (q[3] <= 1209) {
                return 2;
            } else {
                if (q[0] <= 4499) {
                    return 2;
                } else {
                    if (q[1] <= 3930) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_15_predict_fixed(const int16_t* q) {
    if (q[3] <= 1415) {
        if (q[3] <= 1269) {
            if (q[2] <= 1812) {
                if (q[0] <= 4524) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (q[2] <= 1812) {
                    return 2;
                } else {
                    return 2;
                }
            }
        } else {
            if (q[2] <= 1897) {
                if (q[1] <= 3988) {
                    if (q[0] <= 4508) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[1] <= 4526) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[2] <= 1971) {
                    if (q[2] <= 1970) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 2;
                }
            }
        }
    } else {
        if (q[3] <= 1857) {
            if (q[0] <= 4938) {
                if (q[1] <= 3920) {
                    return 2;
                } else {
                    if (q[1] <= 4000) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                return 0;
            }
        } else {
            if (q[0] <= 4938) {
                if (q[0] <= 4498) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_16_predict_fixed(const int16_t* q) {
    if (q[1] <= 4625) {
        if (q[0] <= 4500) {
            return 2;
        } else {
            if (q[1] <= 4584) {
                if (q[3] <= 1914) {
                    return 1;
                } else {
                    if (q[0] <= 4939) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (q[1] <= 4585) {
                    return 0;
                } else {
                    return 1;
                }
            }
        }
    } else {
        if (q[0] <= 4916) {
            return 1;
        } else {
            return 0;
        }
    }
}

static inline int _tree_17_predict_fixed(const int16_t* q) {
    if (q[3] <= 1427) {
        if (q[0] <= 4505) {
            return 2;
        } else {
            if (q[2] <= 1666) {
                if (q[2] <= 1646) {
                    if (q[1] <= 4619) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[3] <= 1371) {
                        return 0;
                    } else {
                        return 0;
                    }
                }
            } else {
                return 1;
            }
        }
    } else {
        if (q[1] <= 4698) {
            if (q[1] <= 3993) {
                if (q[0] <= 4582) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (q[2] <= 1511) {
                    if (q[0] <= 4938) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (q[4] <= 811) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            return 0;
        }
    }
}

static inline int _tree_18_predict_fixed(const int16_t* q) {
    if (q[1] <= 3920) {
        if (q[0] <= 4522) {
            return 2;
        } else {
            if (q[0] <= 4557) {
                return 1;
            } else {
                return 1;
            }
        }
    } else {
        if (q[3] <= 1932) {
            if (q[2] <= 1590) {
                if (q[0] <= 4939) {
                    if (q[1] <= 3933) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            } else {
                if (q[1] <= 4603) {
                    if (q[3] <= 1184) {
                        return 2;
                    } else {
                        return 1;
                    }
                } else {
                    if (q[0] <= 4903) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        } else {
            if (q[0] <= 4938) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}

static inline int _tree_19_predict_fixed(const int16_t* q) {
    if (q[1] <= 4639) {
        if (q[3] <= 1422) {
            if (q[1] <= 3858) {
                if (q[0] <= 4523) {
                    return 2;
                } else {
                    return 1;
                }
            } else {
                if (q[3] <= 1202) {
                    return 2;
                } else {
                    if (q[0] <= 4501) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            }
        } else {
            if (q[2] <= 1804) {
                if (q[1] <= 3946) {
                    return 2;
                } else {
                    if (q[1] <= 4001) {
                        return 1;
                    } else {
                        return 1;
                    }
                }
            } else {
                if (q[1] <= 3918) {
                    return 2;
                } else {
                    if (q[4] <= 1010) {
                        return 1;
                    } else {
                        return 2;
                    }
                }
            }
        }
    } else {
        if (q[4] <= 1125) {
            return 0;
        } else {
            if (q[0] <= 4932) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}


/**
 * @brief Predicts 3-class gait impairment using majority ensemble vote.
 * @param features Array of 5 floats in canonical order:
 *                 [peak_swing_flexion, sagittal_rom, stance_to_swing_ratio, peak_angular_velocity, cadence_spm]
 * @return Class ID: 0 (NORMAL_GAIT), 1 (MILD_FUNCTIONAL_RESTRICTION), 2 (SEVERE_ANTALGIC_STIFF_GAIT).
 */
static inline int kneegait_predict(const float* features) {
    if (features == 0) return -1;
    for (int i = 0; i < KNEEGAIT_NUM_FEATURES; ++i) {
        if (isnan(features[i]) || isinf(features[i])) return -1;
    }
    int votes[KNEEGAIT_NUM_CLASSES] = {0, 0, 0};

    votes[_tree_0_predict(features)]++;
    votes[_tree_1_predict(features)]++;
    votes[_tree_2_predict(features)]++;
    votes[_tree_3_predict(features)]++;
    votes[_tree_4_predict(features)]++;
    votes[_tree_5_predict(features)]++;
    votes[_tree_6_predict(features)]++;
    votes[_tree_7_predict(features)]++;
    votes[_tree_8_predict(features)]++;
    votes[_tree_9_predict(features)]++;
    votes[_tree_10_predict(features)]++;
    votes[_tree_11_predict(features)]++;
    votes[_tree_12_predict(features)]++;
    votes[_tree_13_predict(features)]++;
    votes[_tree_14_predict(features)]++;
    votes[_tree_15_predict(features)]++;
    votes[_tree_16_predict(features)]++;
    votes[_tree_17_predict(features)]++;
    votes[_tree_18_predict(features)]++;
    votes[_tree_19_predict(features)]++;

    int best_class = 0;
    int max_votes = votes[0];
    for (int c = 1; c < KNEEGAIT_NUM_CLASSES; ++c) {
        if (votes[c] >= max_votes) {
            max_votes = votes[c];
            best_class = c;
        }
    }
    return best_class;
}

/**
 * @brief Fixed-point int16 inference API for memory-constrained ESP32 operation.
 */
static inline int kneegait_predict_fixed(const int16_t* features_q) {
    if (features_q == 0) return -1;
    int votes[KNEEGAIT_NUM_CLASSES] = {0, 0, 0};

    votes[_tree_0_predict_fixed(features_q)]++;
    votes[_tree_1_predict_fixed(features_q)]++;
    votes[_tree_2_predict_fixed(features_q)]++;
    votes[_tree_3_predict_fixed(features_q)]++;
    votes[_tree_4_predict_fixed(features_q)]++;
    votes[_tree_5_predict_fixed(features_q)]++;
    votes[_tree_6_predict_fixed(features_q)]++;
    votes[_tree_7_predict_fixed(features_q)]++;
    votes[_tree_8_predict_fixed(features_q)]++;
    votes[_tree_9_predict_fixed(features_q)]++;
    votes[_tree_10_predict_fixed(features_q)]++;
    votes[_tree_11_predict_fixed(features_q)]++;
    votes[_tree_12_predict_fixed(features_q)]++;
    votes[_tree_13_predict_fixed(features_q)]++;
    votes[_tree_14_predict_fixed(features_q)]++;
    votes[_tree_15_predict_fixed(features_q)]++;
    votes[_tree_16_predict_fixed(features_q)]++;
    votes[_tree_17_predict_fixed(features_q)]++;
    votes[_tree_18_predict_fixed(features_q)]++;
    votes[_tree_19_predict_fixed(features_q)]++;

    int best_class = 0;
    int max_votes = votes[0];
    for (int c = 1; c < KNEEGAIT_NUM_CLASSES; ++c) {
        if (votes[c] >= max_votes) {
            max_votes = votes[c];
            best_class = c;
        }
    }
    return best_class;
}

static inline const char* kneegait_get_class_name(int class_id) {
    switch(class_id) {
        case 0: return "NORMAL_GAIT";
        case 1: return "MILD_FUNCTIONAL_RESTRICTION";
        case 2: return "SEVERE_ANTALGIC_STIFF_GAIT";
        default: return "UNKNOWN";
    }
}

static inline const char* kneegait_get_display_label(int class_id) {
    switch(class_id) {
        case 0: return "Normal / Healthy";
        case 1: return "Mild Functional Restriction";
        case 2: return "Severe Antalgic / Stiff Gait";
        default: return "Invalid";
    }
}

/* =========================================================================
 * CONTINUOUS STREAMING FIFO BUFFER & ON-DEVICE STRIDE PROCESSOR
 * ========================================================================= */

#define KNEEGAIT_FIFO_CAPACITY         150    // ~3.0s buffer at 50Hz (fits 0.55s - 2.4s strides)
#define KNEEGAIT_MIN_STRIDE_S          0.55f  // Min duration (cadence <= 218 spm)
#define KNEEGAIT_MAX_STRIDE_S          2.40f  // Max duration (cadence >= 50 spm)
#define KNEEGAIT_REFRACTORY_S          0.40f  // Refractory deadtime after foot strike (prevents bounce)
#define KNEEGAIT_IMPACT_THRESHOLD_G    1.45f  // Shank deceleration impact threshold for heel strike
#define KNEEGAIT_STALE_TIMEOUT_S       2.00f  // Gap threshold to auto-reset FIFO buffer

/**
 * @brief Raw timestamped IMU sample from hardware.
 */
typedef struct {
    float t;            // Timestamp in seconds
    float flexion;      // Knee joint sagittal flexion angle (degrees)
    float ang_vel;      // Angular velocity (deg/s)
    float accel_z;      // Shank vertical acceleration (g)
} kneegait_sample_t;

/**
 * @brief Segmented stride classification event output.
 */
typedef struct {
    int has_stride;                         // 1 if a stride was completed and classified, 0 otherwise
    int class_id;                           // 0: NORMAL, 1: MILD, 2: SEVERE
    const char* class_name;                 // "NORMAL_GAIT", etc.
    const char* display_label;              // "Normal / Healthy", etc.
    float features[KNEEGAIT_NUM_FEATURES];  // Canonical 5 features
    float stride_duration_s;                // Duration of completed stride in seconds
    float cadence_spm;                      // Step cadence in steps/min
    uint32_t stride_count;                  // Total valid strides detected
} kneegait_stride_result_t;

/**
 * @brief Continuous streaming FIFO pipeline state.
 */
typedef struct {
    kneegait_sample_t buffer[KNEEGAIT_FIFO_CAPACITY];
    int head;                               // Circular buffer write index
    int count;                              // Current number of samples in FIFO
    float last_sample_t;                    // Timestamp of previous sample
    float last_hs_t;                        // Timestamp of last detected heel-strike
    int has_first_hs;                       // Flag indicating initial heel-strike established
    uint32_t total_strides;                 // Running counter of segmented strides
} kneegait_pipeline_t;

/**
 * @brief Initializes or resets the continuous streaming FIFO pipeline.
 */
static inline void kneegait_pipeline_init(kneegait_pipeline_t* pipe) {
    if (!pipe) return;
    pipe->head = 0;
    pipe->count = 0;
    pipe->last_sample_t = -1.0f;
    pipe->last_hs_t = -1.0f;
    pipe->has_first_hs = 0;
    pipe->total_strides = 0;
}

/**
 * @brief Processes a single continuous hardware sample at 50Hz.
 * 
 * Ingests raw hardware readings into the internal FIFO ring buffer, tracks
 * gait cycle events (heel-strike impact / terminal extension), segments valid
 * complete strides, computes the 5 canonical features, and executes inference.
 * 
 * @param pipe Pointer to active pipeline state.
 * @param t_sec Sample timestamp in seconds.
 * @param knee_flexion Sagittal knee flexion in degrees.
 * @param accel_z Shank vertical acceleration in g (pass 0.0f if uninstrumented).
 * @param out_result Output struct populated when a full stride cycle completes.
 * @return 1 if a stride was completed and classified, 0 if still buffering.
 */
static inline int kneegait_process_sample(
    kneegait_pipeline_t* pipe,
    float t_sec,
    float knee_flexion,
    float accel_z,
    kneegait_stride_result_t* out_result
) {
    if (!pipe || !out_result) return 0;
    out_result->has_stride = 0;

    // Check for timestamps going backward or duplicate
    if (pipe->last_sample_t >= 0.0f) {
        float dt = t_sec - pipe->last_sample_t;
        if (dt <= 0.0f) {
            return 0; // Ignore duplicate or out-of-order sample
        }
        // If data stream was interrupted (> 2s), reset buffer
        if (dt > KNEEGAIT_STALE_TIMEOUT_S) {
            kneegait_pipeline_init(pipe);
        }
    }

    // Estimate angular velocity from previous sample in FIFO if available
    float ang_vel = 0.0f;
    if (pipe->count > 0) {
        int prev_idx = (pipe->head - 1 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        float dt = t_sec - pipe->buffer[prev_idx].t;
        if (dt > 0.0001f) {
            ang_vel = (knee_flexion - pipe->buffer[prev_idx].flexion) / dt;
        }
    }

    // Push new sample into circular FIFO
    pipe->buffer[pipe->head].t = t_sec;
    pipe->buffer[pipe->head].flexion = knee_flexion;
    pipe->buffer[pipe->head].ang_vel = ang_vel;
    pipe->buffer[pipe->head].accel_z = accel_z;

    pipe->head = (pipe->head + 1) % KNEEGAIT_FIFO_CAPACITY;
    if (pipe->count < KNEEGAIT_FIFO_CAPACITY) {
        pipe->count++;
    }
    pipe->last_sample_t = t_sec;

    // Detect Heel-Strike (Initial Contact):
    // 1. Primary: Shank deceleration impact spike (accel_z >= 1.45g)
    // 2. Fallback (if accel_z unmeasured): Local minimum of flexion (< 15.0 deg) after swing
    int is_heel_strike = 0;
    if (accel_z >= KNEEGAIT_IMPACT_THRESHOLD_G) {
        is_heel_strike = 1;
    } else if (accel_z <= 0.0f && pipe->count >= 3) {
        int i1 = (pipe->head - 1 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        int i2 = (pipe->head - 2 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        int i3 = (pipe->head - 3 + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        if (pipe->buffer[i2].flexion < 15.0f &&
            pipe->buffer[i2].flexion <= pipe->buffer[i3].flexion &&
            pipe->buffer[i2].flexion <= pipe->buffer[i1].flexion) {
            is_heel_strike = 1;
        }
    }

    if (!is_heel_strike) {
        return 0;
    }

    // Apply refractory period (prevent bounce double-triggering)
    if (pipe->has_first_hs && (t_sec - pipe->last_hs_t) < KNEEGAIT_REFRACTORY_S) {
        return 0;
    }

    // If first heel-strike, establish baseline and wait for second heel-strike
    if (!pipe->has_first_hs) {
        pipe->has_first_hs = 1;
        pipe->last_hs_t = t_sec;
        return 0;
    }

    // Second heel-strike detected: complete stride candidate
    float stride_dur = t_sec - pipe->last_hs_t;

    // Check physiological duration bounds [0.55s, 2.40s]
    if (stride_dur < KNEEGAIT_MIN_STRIDE_S || stride_dur > KNEEGAIT_MAX_STRIDE_S) {
        // Invalid duration: reset baseline to current foot strike
        pipe->last_hs_t = t_sec;
        return 0;
    }

    // Extract 5 canonical features across the stride interval [last_hs_t, t_sec]
    float max_flex = -999.0f;
    float min_flex = 999.0f;
    float max_ang_vel = 0.0f;
    float toe_off_t = pipe->last_hs_t + (0.60f * stride_dur); // Default ~60% stance phase

    int n_stride_samples = 0;
    float valley_min = 999.0f;
    float valley_t = toe_off_t;

    // Iterate through FIFO to inspect stride samples
    for (int i = 0; i < pipe->count; ++i) {
        int idx = (pipe->head - 1 - i + KNEEGAIT_FIFO_CAPACITY) % KNEEGAIT_FIFO_CAPACITY;
        float st = pipe->buffer[idx].t;
        if (st < pipe->last_hs_t) break;
        if (st > t_sec) continue;

        float flex = pipe->buffer[idx].flexion;
        float vel = fabsf(pipe->buffer[idx].ang_vel);

        if (flex > max_flex) max_flex = flex;
        if (flex < min_flex) min_flex = flex;
        if (vel > max_ang_vel) max_ang_vel = vel;

        // Track inflection for toe-off (local minimum between 40% and 70% phase)
        float phase = (st - pipe->last_hs_t) / stride_dur;
        if (phase >= 0.40f && phase <= 0.70f) {
            if (flex < valley_min) {
                valley_min = flex;
                valley_t = st;
            }
        }
        n_stride_samples++;
    }

    if (n_stride_samples < 5) {
        pipe->last_hs_t = t_sec;
        return 0;
    }

    if (valley_min < 990.0f) {
        toe_off_t = valley_t;
    }

    float t_stance = toe_off_t - pipe->last_hs_t;
    float t_swing = t_sec - toe_off_t;
    if (t_stance <= 0.05f) t_stance = 0.60f * stride_dur;
    if (t_swing <= 0.05f) t_swing = 0.40f * stride_dur;

    float stance_to_swing = t_stance / t_swing;
    if (stance_to_swing < 1.0f) stance_to_swing = 1.0f;
    if (stance_to_swing > 3.0f) stance_to_swing = 3.0f;

    float cadence_spm = 2.0f * (60.0f / stride_dur);

    // Populate Canonical Features
    out_result->features[FEAT_PEAK_SWING_FLEXION]    = max_flex;
    out_result->features[FEAT_SAGITTAL_ROM]          = max_flex - min_flex;
    out_result->features[FEAT_STANCE_TO_SWING_RATIO] = stance_to_swing;
    out_result->features[FEAT_PEAK_ANGULAR_VELOCITY] = max_ang_vel;
    out_result->features[FEAT_CADENCE_SPM]           = cadence_spm;

    // Run On-Device Random Forest Classifier Directly
    int pred_class = kneegait_predict(out_result->features);
    out_result->has_stride = 1;
    out_result->class_id = pred_class;
    out_result->class_name = kneegait_get_class_name(pred_class);
    out_result->display_label = kneegait_get_display_label(pred_class);
    out_result->stride_duration_s = stride_dur;
    out_result->cadence_spm = cadence_spm;

    pipe->total_strides++;
    out_result->stride_count = pipe->total_strides;

    // Advance stride window: current heel-strike becomes start of next stride
    pipe->last_hs_t = t_sec;

    return 1;
}

/**
 * @brief Millisecond timestamp convenience wrapper for Arduino / ESP32.
 */
static inline int kneegait_process_sample_ms(
    kneegait_pipeline_t* pipe,
    uint32_t t_ms,
    float knee_flexion,
    float accel_z,
    kneegait_stride_result_t* out_result
) {
    return kneegait_process_sample(pipe, (float)t_ms / 1000.0f, knee_flexion, accel_z, out_result);
}

#endif // KNEEGAIT_MODEL_DATA_H
